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
