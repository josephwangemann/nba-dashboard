import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePlayerProfile, parseTeamProfile, parseRoster, parseTeamSchedule, parsePlayerOverview } from '../src/models/profiles.ts'

test('profiles require an identity while allowing missing optional biography and team details', () => {
  assert.equal(parsePlayerProfile({ athlete: { id: '1', displayName: 'Player' } }).athlete.displayName, 'Player')
  assert.equal(parseTeamProfile({ team: { id: '7', displayName: 'Team' } }).team.id, '7')
  for (const invalid of [null, {}, { athlete: {} }]) assert.throws(() => parsePlayerProfile(invalid))
  for (const invalid of [null, {}, { team: {} }]) assert.throws(() => parseTeamProfile(invalid))
})

test('empty rosters, schedules, and missing player stats are valid empty states', () => {
  assert.deepEqual(parseRoster({ athletes: [] }).athletes, [])
  assert.deepEqual(parseTeamSchedule({ events: [] }).events, [])
  assert.deepEqual(parsePlayerOverview({}), {})
  assert.throws(() => parseRoster({}))
  assert.throws(() => parseTeamSchedule({}))
  assert.throws(() => parsePlayerOverview(null))
})
