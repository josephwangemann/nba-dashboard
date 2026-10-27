import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseScoreboard } from '../src/models/scoreboard.ts'

const fixture = broadcasts => ({ events: [{
  id: '401909880', date: '2026-10-28T03:00Z',
  status: { type: { name: 'STATUS_SCHEDULED', state: 'pre' } },
  competitions: [{ broadcasts, competitors: [
    { homeAway: 'away', score: '0', team: { id: '22', name: 'Trail Blazers', location: 'Portland' } },
    { homeAway: 'home', score: '0', team: { id: '13', name: 'Lakers', location: 'Los Angeles' } },
  ] }],
}] })

test('scoreboard retains national and regional TV and streaming listings', () => {
  const broadcasts = [
    { market: 'national', names: ['Peacock', 'NBC'] },
    { market: 'home', names: ['Spectrum Sports Net', 'Spectrum Sports Net +'] },
  ]
  assert.deepEqual(parseScoreboard(fixture(broadcasts), '2026-10-27').games[0].broadcasts, broadcasts)
})

test('missing or empty broadcast listings are omitted and duplicate names are cleaned', () => {
  assert.deepEqual(parseScoreboard(fixture(undefined), '2026-10-27').games[0].broadcasts, [])
  assert.deepEqual(parseScoreboard(fixture([{ names: [] }, { names: [' NBC ', 'NBC', ''] }]), '2026-10-27').games[0].broadcasts, [{ market: '', names: ['NBC'] }])
})
