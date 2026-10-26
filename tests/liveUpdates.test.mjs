import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gameRefreshInterval } from '../src/api/liveUpdates.ts'

const now = 1000000

test('live games refresh every 30 seconds and completed/canceled schedules stop polling', () => {
  assert.equal(gameRefreshInterval([{ state: 'in' }], now), 30000)
  assert.equal(gameRefreshInterval([{ state: 'post' }], now), false)
  assert.equal(gameRefreshInterval([{ state: 'pre', statusName: 'STATUS_POSTPONED' }], now), false)
  assert.equal(gameRefreshInterval([{ state: 'pre', statusName: 'STATUS_CANCELED' }], now), false)
  assert.equal(gameRefreshInterval([], now), false)
})

test('pregame refresh waits for the next tipoff, then polls until the feed transitions', () => {
  const games = [{ state: 'pre', startsAt: now + 600000 }, { state: 'post' }]
  assert.equal(gameRefreshInterval(games, now), 600000)
  assert.equal(gameRefreshInterval(games, now + 600000), 30000)
  assert.equal(gameRefreshInterval([{ state: 'pre', startsAt: NaN }], now), 30000)
  assert.equal(gameRefreshInterval([{ state: 'pre', startsAt: now + 9999999999 }], now), 2147483647)
})
