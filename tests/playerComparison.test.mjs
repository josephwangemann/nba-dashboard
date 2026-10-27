import { test } from 'node:test'
import assert from 'node:assert/strict'
import { playerComparisonValue } from '../src/models/playerComparison.ts'

test('comparison reads turnovers and made threes from ESPN box score values', () => {
  assert.equal(playerComparisonValue('7', 'TO'), 7)
  assert.equal(playerComparisonValue('2-5', '3PT'), 2)
  assert.equal(playerComparisonValue('0-0', '3PT'), 0)
})

test('field goal percentage uses attempts and preserves precision for ranking', () => {
  assert.equal(playerComparisonValue('5-13', 'FG%'), 5 / 13 * 100)
  assert.equal(playerComparisonValue('8-8', 'FG%'), 100)
  assert.equal(playerComparisonValue('0-4', 'FG%'), 0)
  for (const raw of ['0-0', '--', '', '5-3', undefined]) {
    assert.ok(Number.isNaN(playerComparisonValue(raw, 'FG%')))
  }
})
