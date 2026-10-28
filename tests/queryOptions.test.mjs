import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QueryClient } from '@tanstack/react-query'
import { summaryOptions, scoreboardOptions } from '../src/api/queryOptions.ts'
import { ApiError, shouldRetry, fetchJson } from '../src/api/client.ts'

const final = () => ({ header: { competitions: [{ status: { type: { state: 'post' } }, competitors: [] }] }, boxscore: {} })
const createClient = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })

test('summary prefetch and navigation share a cache entry and concurrent requests', async () => {
  const original = globalThis.fetch, client = createClient()
  let calls = 0
  try {
    globalThis.fetch = async () => { calls++; return new Response(JSON.stringify(final())) }
    await Promise.all([client.prefetchQuery(summaryOptions('1')), client.fetchQuery(summaryOptions('1'))])
    await client.fetchQuery(summaryOptions('1'))
    assert.equal(calls, 1)
    assert.ok(client.getQueryData(['boxScore', '1']).finalObservedAt)
  } finally { client.clear(); globalThis.fetch = original }
})

test('final timestamps belong to the calling query client and survive refetches', async () => {
  const originalFetch = globalThis.fetch, originalNow = Date.now
  const first = createClient(), second = createClient()
  let now = 1000
  try {
    Date.now = () => now
    globalThis.fetch = async () => new Response(JSON.stringify(final()))
    const options = { ...summaryOptions('2'), staleTime: 0 }
    assert.equal((await first.fetchQuery(options)).finalObservedAt, 1000)
    now = 61000
    assert.equal((await first.fetchQuery(options)).finalObservedAt, 1000)
    assert.equal((await second.fetchQuery(options)).finalObservedAt, 61000)
    now = 901000
    const query = first.getQueryCache().find({ queryKey: ['boxScore', '2'] })
    assert.equal(summaryOptions('2').staleTime(query), 6 * 3600000)
  } finally { first.clear(); second.clear(); globalThis.fetch = originalFetch; Date.now = originalNow }
})

test('returning a game to live clears the final settling timestamp', async () => {
  const original = globalThis.fetch, client = createClient()
  try {
    client.setQueryData(['boxScore', '3'], { ...final(), finalObservedAt: 1000 })
    const live = final()
    live.header.competitions[0].status.type.state = 'in'
    globalThis.fetch = async () => new Response(JSON.stringify(live))
    const result = await client.fetchQuery({ ...summaryOptions('3'), staleTime: 0 })
    assert.equal(result.finalObservedAt, undefined)
  } finally { client.clear(); globalThis.fetch = original }
})

test('changing view cancels in-flight scoreboard work instead of saving abandoned results', async () => {
  const original = globalThis.fetch, client = createClient()
  let upstream
  try {
    globalThis.fetch = (_, { signal }) => {
      upstream = signal
      return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))
    }
    const pending = client.fetchQuery(scoreboardOptions('2026-10-28')).catch(() => undefined)
    await client.cancelQueries({ queryKey: ['scoreboard', '2026-10-28'] })
    await pending
    assert.equal(upstream.aborted, true)
    assert.equal(client.getQueryData(['scoreboard', '2026-10-28']), undefined)
  } finally { client.clear(); globalThis.fetch = original }
})

test('unavailable resources do not retry, while temporary server errors may retry once', () => {
  assert.equal(shouldRetry(0, new ApiError('Missing', 404)), false)
  assert.equal(shouldRetry(0, new ApiError('Bad request', 400)), false)
  assert.equal(shouldRetry(0, new ApiError('Busy', 429)), true)
  assert.equal(shouldRetry(0, new ApiError('Upstream failed', 502)), true)
  assert.equal(shouldRetry(1, new ApiError('Upstream failed', 502)), false)
})

test('timeouts are labeled, malformed JSON is distinct, and navigation aborts are preserved', async () => {
  const originalFetch = globalThis.fetch, originalTimeout = AbortSignal.timeout
  try {
    globalThis.fetch = async () => new Response('not json')
    await assert.rejects(fetchJson('/api/test', new AbortController().signal, 'Stats'), /Stats returned an invalid response/)
    const timeout = new AbortController()
    timeout.abort()
    AbortSignal.timeout = () => timeout.signal
    globalThis.fetch = async () => { throw new DOMException('Timed out', 'TimeoutError') }
    await assert.rejects(fetchJson('/api/test', new AbortController().signal, 'Stats'), /Stats request timed out/)
    const navigation = new AbortController()
    navigation.abort()
    const reason = new DOMException('Left the page', 'AbortError')
    globalThis.fetch = async () => { throw reason }
    await assert.rejects(fetchJson('/api/test', navigation.signal, 'Stats'), error => error === reason)
  } finally { globalThis.fetch = originalFetch; AbortSignal.timeout = originalTimeout }
})
