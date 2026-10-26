import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePlayerGameLog } from '../src/models/playerGameLog.ts'

const fixture = () => ({
  names: ['points', 'minutes', 'assists', 'totalRebounds'],
  events: { '1': { gameDate: '2026-10-26T02:00:00Z', opponent: { id: '26', displayName: 'Utah Jazz' }, gameResult: 'W', score: '132-123' } },
  seasonTypes: [{ displayName: '2026-27 Regular Season', categories: [{ events: [{ eventId: '1', stats: ['52', '38', '10', '8'] }] }] }],
})

test('game logs match statistics by name and link late games to the correct NBA schedule date', () => {
  const [game] = parsePlayerGameLog(fixture())
  assert.equal(game.scheduleDate, '2026-10-25')
  assert.equal(game.points, '52')
  assert.equal(game.minutes, '38')
  assert.equal(game.rebounds, '8')
  assert.equal(game.assists, '10')
  assert.equal(game.result, 'W')
})

test('no appearances and preseason-only data omit recent games', () => {
  const data = fixture()
  data.seasonTypes[0].displayName = '2026-27 Preseason'
  assert.deepEqual(parsePlayerGameLog(data), [])
  data.seasonTypes[0].displayName = '2026-27 Regular Season'
  data.seasonTypes[0].categories[0].events[0].stats[1] = 'DNP'
  assert.deepEqual(parsePlayerGameLog(data), [])
  assert.deepEqual(parsePlayerGameLog({ names: [], events: {}, seasonTypes: [] }), [])
  assert.throws(() => parsePlayerGameLog(null))
})

test('recent games are limited to ten distinct games in descending date order', () => {
  const data = fixture()
  for (let index = 2; index <= 12; index++) {
    data.events[index] = { gameDate: `2026-10-${String(index).padStart(2, '0')}T20:00:00Z` }
    data.seasonTypes[0].categories[0].events.push({ eventId: String(index), stats: ['10', '20', '3', '4'] })
  }
  data.seasonTypes[0].categories[0].events.push(data.seasonTypes[0].categories[0].events[0])
  const result = parsePlayerGameLog(data)
  assert.equal(result.length, 10)
  assert.equal(result[0].id, '1')
  assert.equal(new Set(result.map(game => game.id)).size, 10)
})
