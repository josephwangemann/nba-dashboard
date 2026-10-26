import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseLeaders } from '../src/models/leaders.ts'

const category = (name, value, displayValue) => ({ name, displayName: name, leaders: [{ athlete: { id: '1', displayName: 'Player' }, value, displayValue }] })

test('three-point percentages use precise fractions rather than rounded display values', () => {
  for (const [value, display, expected] of [[0.75, '0.8', '75.0%'], [0.6, '0.6', '60.0%'], [1, '1.0', '100.0%'], [0, '0.0', '0.0%'], [0.7142857, '0.7', '71.4%']]) {
    const result = parseLeaders({ leaders: { categories: [category('3PointPct', value, display)] } })
    assert.equal(result.categories[0].players[0].value, expected)
  }
})

test('double doubles are whole counts while other percentages retain their existing scale', () => {
  const result = parseLeaders({ leaders: { categories: [category('doubleDouble', 3, '3.0'), category('fieldGoalPercentage', 82.143, '82.1'), category('FreeThrowPct', 100, '100.0')] } })
  assert.deepEqual(result.categories.map(item => item.players[0].value), ['3', '82.1', '100.0'])
})
