import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shiftDate, nbaScheduleDate } from '../src/utils/date.ts'

test('day navigation crosses month, leap-day, year, and DST boundaries', () => {
  assert.equal(shiftDate('2026-01-01', -1), '2025-12-31')
  assert.equal(shiftDate('2024-02-28', 1), '2024-02-29')
  assert.equal(shiftDate('2024-02-29', 1), '2024-03-01')
  assert.equal(shiftDate('2026-03-08', 1), '2026-03-09')
  assert.equal(shiftDate('2026-11-01', -1), '2026-10-31')
})

test('schedule links use the NBA Eastern date for late games across DST', () => {
  assert.equal(nbaScheduleDate(new Date('2026-10-27T02:00:00Z')), '2026-10-26')
  assert.equal(nbaScheduleDate(new Date('2026-12-02T04:30:00Z')), '2026-12-01')
  assert.equal(nbaScheduleDate(new Date('2026-10-27T23:30:00Z')), '2026-10-27')
})
