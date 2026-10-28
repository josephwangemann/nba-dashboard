import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { handleEspnRequest } from '../server/espnProxy.ts'

const response = () => Object.assign(new EventEmitter(), {
  writableEnded: false,
  writeHead(status, headers) { this.status = status; this.headers = headers },
  end(body) { this.body = body; this.writableEnded = true },
})

test('team proxy restricts destinations and methods', async () => {
  assert.equal(await handleEspnRequest({ url: '/api/teams/https://evil.example', method: 'GET' }, response()), false)
  assert.equal(await handleEspnRequest({ url: '/api/teams/7/unknown', method: 'GET' }, response()), false)
  const res = response()
  assert.equal(await handleEspnRequest({ url: '/api/teams/7', method: 'POST' }, res), true)
  assert.equal(res.status, 405)
})

test('team proxy forwards only fixed ESPN team endpoints and handles upstream failures', async () => {
  const originalFetch = globalThis.fetch
  try {
    let destination
    globalThis.fetch = async url => { destination = url; return new Response('{"athletes":[]}', { status: 200 }) }
    const res = response()
    await handleEspnRequest({ url: '/api/teams/7/roster?url=https://evil.example', method: 'GET' }, res)
    assert.equal(destination, 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/7/roster')
    assert.equal(res.status, 200)
    assert.deepEqual(JSON.parse(res.body), { athletes: [] })
    globalThis.fetch = async () => { throw new Error('Offline') }
    const failed = response()
    await handleEspnRequest({ url: '/api/teams/7', method: 'GET' }, failed)
    assert.equal(failed.status, 502)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('compact proxy deduplicates concurrent requests and caches successful results', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let complete
  let calls = 0
  try {
    globalThis.fetch = async () => { calls++; await new Promise(resolve => { complete = resolve }); return new Response(JSON.stringify({ boxscore: {}, plays: ['discard me'] })) }
    const a = response(), b = response()
    const first = handleEspnRequest({ url: '/api/games/100', method: 'GET' }, a)
    const second = handleEspnRequest({ url: '/api/games/100', method: 'GET' }, b)
    assert.equal(calls, 1)
    complete()
    await Promise.all([first, second])
    assert.deepEqual(JSON.parse(a.body), { boxscore: {} })
    assert.equal(a.body, b.body)
    const cached = response()
    await handleEspnRequest({ url: '/api/games/100', method: 'GET' }, cached)
    assert.equal(calls, 1)
    assert.equal(cached.body, a.body)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('one disconnected client does not cancel another client sharing an upstream request', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let complete, upstreamSignal
  try {
    globalThis.fetch = async (_, options) => { upstreamSignal = options.signal; await new Promise(resolve => { complete = resolve }); return new Response('{"boxscore":{}}') }
    const a = response(), b = response()
    const first = handleEspnRequest({ url: '/api/games/101', method: 'GET' }, a)
    const second = handleEspnRequest({ url: '/api/games/101', method: 'GET' }, b)
    a.emit('close')
    assert.equal(upstreamSignal.aborted, false)
    complete()
    await Promise.all([first, second])
    assert.equal(a.body, undefined)
    assert.equal(b.status, 200)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('proxy does not cache failures or accept malformed nested summaries', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let calls = 0
  try {
    globalThis.fetch = async () => { calls++; return new Response('{"header":{"competitions":42}}') }
    for (let i = 0; i < 2; i++) {
      const res = response()
      await handleEspnRequest({ url: '/api/games/102', method: 'GET' }, res)
      assert.equal(res.status, 502)
    }
    assert.equal(calls, 2)
    assert.equal(await handleEspnRequest({ url: '/api/scoreboard/2026-02-30', method: 'GET' }, response()), false)
    assert.equal(await handleEspnRequest({ url: '/api/leaders/2026/2/evil', method: 'GET' }, response()), false)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('shared upstream request is aborted after its last client disconnects', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let upstreamSignal
  try {
    globalThis.fetch = async (_, options) => {
      upstreamSignal = options.signal
      return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))
    }
    const res = response()
    const request = handleEspnRequest({ url: '/api/games/103', method: 'GET' }, res)
    res.emit('close')
    await request
    assert.equal(upstreamSignal.aborted, true)
    assert.equal(res.body, undefined)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('server cache expires and fetches fresh upstream data', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const originalFetch = globalThis.fetch, originalNow = Date.now
  let now = 1000, calls = 0
  try {
    Date.now = () => now
    globalThis.fetch = async () => { calls++; return new Response('{"boxscore":{}}') }
    await handleEspnRequest({ url: '/api/games/104', method: 'GET' }, response())
    now += 14999
    const nearlyExpired = response()
    await handleEspnRequest({ url: '/api/games/104', method: 'GET' }, nearlyExpired)
    assert.equal(nearlyExpired.headers['Cache-Control'], 'public, max-age=0')
    assert.equal(calls, 1)
    now++
    await handleEspnRequest({ url: '/api/games/104', method: 'GET' }, response())
    assert.equal(calls, 2)
  } finally { globalThis.fetch = originalFetch; Date.now = originalNow; clearEspnCache() }
})

test('a synchronously failing upstream does not leave a stuck shared request', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let calls = 0
  try {
    globalThis.fetch = () => { calls++; throw new Error('Synchronous fetch failure') }
    for (let i = 0; i < 2; i++) {
      const res = response()
      await handleEspnRequest({ url: '/api/games/105', method: 'GET' }, res)
      assert.equal(res.status, 502)
    }
    assert.equal(calls, 2)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('abandoned upstream results cannot overwrite a replacement request', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  const finish = []
  try {
    globalThis.fetch = () => new Promise(resolve => finish.push(resolve))
    const abandoned = response(), replacement = response()
    const first = handleEspnRequest({ url: '/api/games/106', method: 'GET' }, abandoned)
    abandoned.emit('close')
    const second = handleEspnRequest({ url: '/api/games/106', method: 'GET' }, replacement)
    assert.equal(finish.length, 2)
    finish[1](new Response('{"boxscore":{}}'))
    await second
    finish[0](new Response('{"boxscore":{"players":[]}}'))
    await first
    const cached = response()
    await handleEspnRequest({ url: '/api/games/106', method: 'GET' }, cached)
    assert.deepEqual(JSON.parse(cached.body), { boxscore: {} })
    assert.equal(abandoned.body, undefined)
  } finally { globalThis.fetch = original; clearEspnCache() }
})

test('shared response cache is bounded and evicts old entries', async () => {
  const { clearEspnCache } = await import('../server/espnProxy.ts')
  clearEspnCache()
  const original = globalThis.fetch
  let calls = 0
  try {
    globalThis.fetch = async () => { calls++; return new Response('{"boxscore":{}}') }
    for (let i = 200; i <= 300; i++) await handleEspnRequest({ url: `/api/games/${i}`, method: 'GET' }, response())
    assert.equal(calls, 101)
    await handleEspnRequest({ url: '/api/games/300', method: 'GET' }, response())
    assert.equal(calls, 101)
    await handleEspnRequest({ url: '/api/games/200', method: 'GET' }, response())
    assert.equal(calls, 102)
  } finally { globalThis.fetch = original; clearEspnCache() }
})
