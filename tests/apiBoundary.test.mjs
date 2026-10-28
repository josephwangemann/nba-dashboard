import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseSummary } from '../src/models/summary.ts'
import { parseRoster, parseTeamSchedule, parsePlayerOverview } from '../src/models/profiles.ts'
import { gameFromSummary } from '../src/models/summaryGame.ts'
import { finalFreshness, observeFinal } from '../src/api/finalFreshness.ts'
import { fetchJson } from '../src/api/client.ts'

const summary = () => ({
  header: { competitions: [{ date: '2026-10-28T03:00Z', status: { type: { state: 'pre', name: 'STATUS_SCHEDULED' } }, competitors: [
    { homeAway: 'home', score: '0', team: { id: '13', displayName: 'Los Angeles Lakers', name: 'Lakers', location: 'Los Angeles' } },
    { homeAway: 'away', score: '0', team: { id: '22', displayName: 'Portland Trail Blazers', name: 'Trail Blazers', location: 'Portland' } },
  ] }] },
  gameInfo: { venue: { fullName: 'Arena', address: { city: 'Los Angeles', state: 'CA' } } },
  plays: [{ text: 'large unused play data' }], videos: [{ description: 'unused video data' }],
})

test('summary validates nested fields, strips unused payloads, and supports partial games', () => {
  const data = parseSummary(summary())
  assert.equal(data.plays, undefined)
  assert.equal(data.videos, undefined)
  assert.deepEqual(parseSummary({ boxscore: {} }), { boxscore: {} })
  assert.throws(() => parseSummary({ header: { competitions: 'bad' } }))
  assert.throws(() => parseSummary({ boxscore: { players: [{ team: { id: '1' }, statistics: [] }] } }))
  assert.throws(() => parseSummary({}))
})

test('summary alone can render game details without a scoreboard response', () => {
  const game = gameFromSummary('401909880', parseSummary(summary()))
  assert.equal(game.homeTeam.teamName, 'Lakers')
  assert.equal(game.awayTeam.teamName, 'Trail Blazers')
  assert.equal(game.venue, 'Arena · Los Angeles, CA')
  assert.equal(game.state, 'pre')
  assert.equal(gameFromSummary('1', { boxscore: {} }), undefined)
})

test('profile parsers reject malformed nested data and discard unrelated fields', () => {
  assert.throws(() => parseRoster({ athletes: [null] }))
  assert.throws(() => parseRoster({ athletes: [{ id: '1', displayName: 'Player', age: 'twenty' }] }))
  assert.throws(() => parseTeamSchedule({ events: [{ id: '1', date: 'today', name: 'Game', competitions: [{ competitors: [null] }] }] }))
  assert.throws(() => parsePlayerOverview({ statistics: { splits: [{ displayName: 'Season', stats: 'bad' }] } }))
  assert.deepEqual(parseRoster({ athletes: [], news: 'unused' }), { athletes: [] })
})

test('new finals settle before long caching, and corrections remain recheckable', () => {
  const observed = observeFinal(true, undefined, 1000)
  assert.equal(observed, 1000)
  assert.equal(observeFinal(true, observed, 60000), 1000)
  assert.equal(finalFreshness(observed, 1000 + 14 * 60000), 30000)
  assert.equal(finalFreshness(observed, 1000 + 15 * 60000), 6 * 3600000)
  assert.equal(observeFinal(false, observed), undefined)
  assert.equal(finalFreshness(undefined, 10000000), 30000)
})

test('browser fetch combines request cancellation with a timeout and identifies unavailable data', async () => {
  const original = globalThis.fetch
  try {
    const controller = new AbortController()
    let combined
    globalThis.fetch = async (_, options) => { combined = options.signal; return new Response('{}') }
    await fetchJson('/api/test', controller.signal, 'Test')
    assert.notEqual(combined, controller.signal)
    controller.abort()
    assert.equal(combined.aborted, true)
    globalThis.fetch = async () => new Response('', { status: 404 })
    await assert.rejects(fetchJson('/api/test', new AbortController().signal, 'Player'), /Player is unavailable/)
  } finally { globalThis.fetch = original }
})

test('captured ESPN game fixture validates DNP rows, team statistics, series, and venue', async () => {
  const { readFile } = await import('node:fs/promises')
  const raw = JSON.parse(await readFile(new URL('./fixtures/espn-summary.json', import.meta.url)))
  const data = parseSummary(raw)
  assert.equal(data.boxscore.players[0].statistics[0].athletes.some(player => player.didNotPlay), true)
  assert.equal(data.gameInfo.venue.fullName, 'Paycom Center')
  assert.equal(data.seasonseries[1].type, 'playoff')
  assert.equal(data.plays, undefined)
  assert.ok(JSON.stringify(data).length < JSON.stringify(raw).length / 2)
})

test('partial box scores keep players with missing stats as empty rows', () => {
  const data = parseSummary({ boxscore: { players: [{ team: { id: '1', displayName: 'Team' }, statistics: [{ labels: ['PTS'], athletes: [{ athlete: { id: '2', displayName: 'Player' } }] }] }] } })
  assert.deepEqual(data.boxscore.players[0].statistics[0].athletes[0].stats, [])
})
