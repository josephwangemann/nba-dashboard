import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ACTIVE_TTL, parseSchedule, scheduleDates, standingsFreshness } from '../src/standingsFreshness.ts'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClientRestore, persistQueryClientSave } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const now = Date.parse('2026-10-26T08:00:00Z')
const game = (overrides = {}) => ({ id: '1', startsAt: now - 4 * 3600000, completed: false, state: 'in', name: 'STATUS_IN_PROGRESS', ...overrides })

test('live, delayed, and suspended games use five-minute freshness', () => {
  for (const overrides of [{}, { state: 'pre', name: 'STATUS_DELAYED' }, { name: 'STATUS_SUSPENDED' }]) {
    assert.equal(standingsFreshness([game(overrides)], now).freshUntil, now + ACTIVE_TTL)
  }
})

test('new finals get a grace period, then stay fresh until an early tipoff', () => {
  const final = game({ completed: true, state: 'post', name: 'STATUS_FINAL' })
  const early = game({ id: '2', startsAt: now + 3 * 3600000, state: 'pre', name: 'STATUS_SCHEDULED' })
  const first = standingsFreshness([final, early], now)
  assert.equal(first.freshUntil, now + ACTIVE_TTL)
  const settled = standingsFreshness([final, early], now + 15 * 60000, first)
  assert.equal(settled.freshUntil, early.startsAt)
  assert.equal(standingsFreshness([final, early], early.startsAt, settled).freshUntil, early.startsAt + ACTIVE_TTL)
  const anotherFinal = game({ id: '3', completed: true, state: 'post', name: 'STATUS_FINAL' })
  assert.equal(standingsFreshness([final, anotherFinal, early], now + 20 * 60000, settled).freshUntil, now + 25 * 60000)
})

test('quiet periods recheck schedules within six hours; postponed games do not force active polling', () => {
  assert.equal(standingsFreshness([], now).freshUntil, now + 6 * 3600000)
  assert.equal(standingsFreshness([game({ name: 'STATUS_POSTPONED' })], now).freshUntil, now + 6 * 3600000)
})

test('schedule days follow Eastern NBA dates across DST rather than browser timezone', () => {
  assert.deepEqual(scheduleDates(Date.parse('2026-11-01T04:30:00Z')), ['20261031', '20261101', '20261102'])
  assert.deepEqual(scheduleDates(Date.parse('2026-11-01T03:30:00Z')), ['20261030', '20261031', '20261101'])
})

test('schedule parser accepts empty days and rejects unknown response shapes', () => {
  assert.deepEqual(parseSchedule({ events: [] }), [])
  assert.throws(() => parseSchedule({}))
  assert.throws(() => parseSchedule({ events: [{ id: '1' }] }))
})

test('persisted standings restore data and freshness timestamps into a new query client', async () => {
  const storage = new Map()
  const persister = createSyncStoragePersister({
    storage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    throttleTime: 0,
  })
  const first = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  const second = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  const data = { season: '2026-27', conferences: [], freshness: standingsFreshness([], Date.now()) }
  first.setQueryData(['standings'], data)
  const updatedAt = first.getQueryState(['standings']).dataUpdatedAt
  const options = { persister, buster: 'test', maxAge: 86400000 }
  await persistQueryClientSave({ ...options, queryClient: first })
  await new Promise(resolve => setTimeout(resolve, 10))
  await persistQueryClientRestore({ ...options, queryClient: second })
  assert.deepEqual(second.getQueryData(['standings']), data)
  assert.equal(second.getQueryState(['standings']).dataUpdatedAt, updatedAt)
  first.clear()
  second.clear()
})
