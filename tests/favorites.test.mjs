import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseFavoriteTeams, prioritizeFavoriteGames } from '../src/utils/favorites.ts'

const game = (id, home, away) => ({ id, homeTeam: { teamId: home }, awayTeam: { teamId: away } })

test('favorite preferences tolerate missing, corrupted, duplicate, and invalid stored values', () => {
  assert.deepEqual(parseFavoriteTeams(null), [])
  assert.deepEqual(parseFavoriteTeams('invalid'), [])
  assert.deepEqual(parseFavoriteTeams('{}'), [])
  assert.deepEqual(parseFavoriteTeams('["7","7","13",null,7,"bad"]'), ['7', '13'])
})

test('favorite games come first for either team without disturbing order or duplicating matchups', () => {
  const games = [game('a', 1, 2), game('b', 7, 3), game('c', 4, 5), game('d', 6, 13), game('e', 7, 13)]
  const result = prioritizeFavoriteGames(games, ['7', '13'])
  assert.deepEqual(result.map(game => game.id), ['b', 'd', 'e', 'a', 'c'])
  assert.deepEqual(games.map(game => game.id), ['a', 'b', 'c', 'd', 'e'])
  assert.deepEqual(prioritizeFavoriteGames(games, []), games)
  assert.deepEqual(prioritizeFavoriteGames([], ['7']), [])
})
