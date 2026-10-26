import { test } from 'node:test'
import assert from 'node:assert/strict'
import { updatedGame } from '../src/models/boxScore.ts'

const game = { gameId: '1', state: 'pre', gameStatusText: '5:00 PM MDT', venue: '', awayTeam: { teamId: 1, teamName: 'Away', teamCity: '', score: 0 }, homeTeam: { teamId: 2, teamName: 'Home', teamCity: '', score: 0 } }
const summary = (state, detail, away, home) => ({ header: { competitions: [{ status: { type: { state, detail, name: state === 'pre' ? 'STATUS_SCHEDULED' : state === 'post' ? 'STATUS_FINAL' : 'STATUS_IN_PROGRESS' } }, competitors: [{ homeAway: 'home', score: home }, { homeAway: 'away', score: away }] }] } })

test('game details transition from pregame to live to final using summary scores and clock', () => {
  const pre = updatedGame(game, summary('pre', 'Scheduled', '0', '0'))
  assert.equal(pre.gameStatusText, '5:00 PM MDT')
  const live = updatedGame(game, summary('in', '4:32 - 2nd Quarter', '42', '45'))
  assert.equal(live.state, 'in')
  assert.equal(live.gameStatusText, 'LIVE · 4:32 - 2nd Quarter')
  assert.equal(live.awayTeam.score, 42)
  assert.equal(live.homeTeam.score, 45)
  const final = updatedGame(live, summary('post', 'Final', '102', '100'))
  assert.equal(final.state, 'post')
  assert.equal(final.gameStatusText, 'Final')
  assert.equal(final.awayTeam.score, 102)
  assert.equal(game.state, 'pre')
})

test('missing summaries and invalid scores preserve previously available game data', () => {
  assert.deepEqual(updatedGame(game), game)
  const previous = { ...game, awayTeam: { ...game.awayTeam, score: 25 }, homeTeam: { ...game.homeTeam, score: 30 } }
  const result = updatedGame(previous, summary('in', 'Halftime', '', 'bad'))
  assert.equal(result.awayTeam.score, 25)
  assert.equal(result.homeTeam.score, 30)
})
