import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getTeamLogo } from '../src/models/teamLogo.ts'

test('team logos prefer dark variants and tolerate missing branding', () => {
  assert.equal(getTeamLogo({ logos: [{ href: 'default.png' }, { href: 'dark.png', rel: ['dark'] }] }), 'dark.png')
  assert.equal(getTeamLogo({ logo: 'scoreboard.png' }), 'scoreboard.png')
  assert.equal(getTeamLogo({ logos: [{ href: 'default.png' }] }), 'default.png')
  assert.equal(getTeamLogo({}), undefined)
  assert.equal(getTeamLogo({ logos: [] }), undefined)
})
