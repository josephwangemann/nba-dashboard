import { test } from 'node:test'
import assert from 'node:assert/strict'
import { headToHeadSeries } from '../src/models/headToHead.ts'

const event = (id, date) => ({ id, date, status: 'post', competitors: [
  { homeAway: 'home', score: '103', team: { id: '25', displayName: 'Oklahoma City Thunder' } },
  { homeAway: 'away', score: '91', team: { id: '11', displayName: 'Indiana Pacers' } },
] })

test('series preserve summaries, sort matchups, and link late games using the NBA date', () => {
  const [series] = headToHeadSeries([{ description: 'NBA Finals', summary: 'OKC wins series 4-3', events: [event('2', '2025-06-23T00:00:00Z'), event('1', '2025-06-20T00:30:00Z')] }])
  assert.equal(series.title, 'Playoffs')
  assert.equal(series.summary, 'OKC wins series 4-3')
  assert.deepEqual(series.games.map(game => game.id), ['1', '2'])
  assert.equal(series.games[1].scheduleDate, '2025-06-22')
  assert.equal(series.games[1].away.score, '91')
  assert.equal(series.games[1].home.score, '103')
})

test('missing series and incomplete matchups are safely omitted', () => {
  assert.deepEqual(headToHeadSeries(), [])
  assert.deepEqual(headToHeadSeries([{ events: [event('1', 'bad'), event('bad', '2025-06-23T00:00Z'), { id: '3', date: '2025-06-23T00:00Z' }] }, {}]), [])
})

test('regular season matchups do not create an empty playoffs section', () => {
  const series = headToHeadSeries([{ type: 'season', events: [event('1', '2025-06-23T00:00Z')] }, { type: 'playoff', events: [] }])
  assert.deepEqual(series.map(item => item.title), ['Regular Season Matchups'])
})
