import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const getStorage = () => {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export const persistOptions = {
  persister: createSyncStoragePersister({ storage: getStorage(), key: 'nothing-but-net-query-cache', throttleTime: 0 }),
  maxAge: 24 * 60 * 60 * 1000,
  buster: 'league-schedule-v6',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[]; state: { data: unknown } }) => ['standings', 'leaders'].includes(String(query.queryKey[0])) && query.state.data !== undefined,
  },
}
