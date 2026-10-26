import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute } from '../src/navigation/routes.ts'

const today = '2026-10-26'

test('tab and game routes retain their selected date on reload or history navigation', () => {
  for (const type of ['games', 'standings', 'stats', 'teams']) {
    assert.deepEqual(parseRoute(`#/${type}?date=2026-10-25`, today), { type, date: '2026-10-25' })
  }
  assert.deepEqual(parseRoute('#/game/401909868?date=2026-10-25', today), { type: 'game', id: '401909868', date: '2026-10-25' })
})

test('existing profile URLs keep working and malformed dates safely fall back to today', () => {
  assert.deepEqual(parseRoute('#/player/4065733', today), { type: 'player', id: '4065733', date: today })
  assert.deepEqual(parseRoute('#/team/7', today), { type: 'team', id: '7', date: today })
  for (const date of ['2026-99-99', '2026-02-30', 'garbage']) {
    assert.deepEqual(parseRoute(`#/games?date=${date}`, today), { type: 'games', date: today })
  }
  assert.deepEqual(parseRoute('#/game/invalid', today), { type: 'games', date: today })
  assert.deepEqual(parseRoute('', today), { type: 'games', date: today })
})
