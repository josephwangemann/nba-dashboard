import { useMemo } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { gameRefreshInterval } from './liveUpdates'
import { fetchJson } from './client'
import { scoreboardOptions, summaryOptions } from './queryOptions'
export { queryClient, scoreboardOptions, summaryOptions } from './queryOptions'
import { ACTIVE_TTL, scheduleDates, standingsFreshness, type Freshness } from './standingsFreshness'
import { finalFreshness } from './finalFreshness'
import { parseStandingsData, parseLeadersData, parseLeaderCategory } from '../models/apiData'
import type { Scoreboard } from '../models/scoreboard'
import type { Leaders } from '../models/leaders'

export const useScoreboard = (date: string, enabled: boolean, liveUpdates = true) => useQuery({
  ...scoreboardOptions(date), enabled,
  refetchInterval: query => {
    const data = query.state.data
    if (!liveUpdates || !data) return false
    return data.finalObservedAt !== undefined && finalFreshness(data.finalObservedAt) === 30000 ? 30000 : gameRefreshInterval(data.games)
  },
})

export const useGameSummary = (gameId: string) => useQuery({
  ...summaryOptions(gameId),
  refetchInterval: query => {
    const data = query.state.data
    const competition = data?.header?.competitions[0]
    if (!competition) return false
    if (data?.finalObservedAt !== undefined && finalFreshness(data.finalObservedAt) === 30000) return 30000
    return gameRefreshInterval([{ state: competition.status?.type?.state ?? '', statusName: competition.status?.type?.name, startsAt: Date.parse(competition.date ?? '') }])
  },
})

type CachedData<T> = T & { freshness: Freshness }
const useScheduledQuery = <T,>(key: string, load: (signal: AbortSignal) => Promise<T>) => {
  const client = useQueryClient()
  const window = useQuery({ queryKey: ['scheduleWindow'], queryFn: () => scheduleDates(Date.now()),
    initialData: () => scheduleDates(Date.now()), staleTime: 60000, refetchInterval: 60000 })
  const dates = window.data.map(date => `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`)
  // Schedule checks warm the shared cache independently of the screen's main query.
  const schedules = useQueries({ queries: dates.map(date => ({
    ...scoreboardOptions(date),
    refetchInterval: (query: { state: { data?: Scoreboard } }) => {
      const data = query.state.data
      if (!data) return ACTIVE_TTL
      if (data.finalObservedAt !== undefined && finalFreshness(data.finalObservedAt) === 30000) return 30000
      return gameRefreshInterval(data.games) || 6 * 60 * 60 * 1000
    },
  })) })
  const calculateFreshness = (): Freshness => {
    const now = Date.now()
    if (!schedules.every(query => query.data && !query.error)) return { freshUntil: now + ACTIVE_TTL, finalIds: '', finalsObservedAt: now }
    const games = schedules.flatMap(query => query.data?.games ?? []).map(game => ({
      id: game.gameId, startsAt: game.startsAt ?? 0, completed: game.state === 'post', state: game.state, name: game.statusName ?? '',
    }))
    return standingsFreshness(games, now, client.getQueryData<CachedData<T>>([key])?.freshness)
  }
  return useQuery<CachedData<T>>({
    queryKey: [key], gcTime: 24 * 60 * 60 * 1000,
    staleTime: query => Math.max(0, Math.min(calculateFreshness().freshUntil, query.state.data?.freshness.freshUntil ?? Infinity) - query.state.dataUpdatedAt),
    refetchInterval: query => query.state.status === 'error' ? ACTIVE_TTL : Math.max(1000, Math.min(calculateFreshness().freshUntil, query.state.data?.freshness.freshUntil ?? Infinity) - Date.now()),
    queryFn: async ({ signal }) => ({ ...await load(signal), freshness: calculateFreshness() }),
  })
}
export const useStandings = () => useScheduledQuery('standings', async signal => parseStandingsData(await fetchJson('/api/standings', signal, 'Standings')))

export const useLeaders = () => {
  const base = useScheduledQuery('leaders', async signal => parseLeadersData(await fetchJson('/api/leaders', signal, 'Stats')))
  const year = base.data?.seasonYear
  const seasonType = base.data?.seasonType
  const extras = useQueries({ queries: ['tripleDouble', 'threePointFieldGoalsMade'].map(stat => ({
    queryKey: ['extraLeaders', year, seasonType, stat], enabled: !!year && !!seasonType,
    staleTime: ACTIVE_TTL, refetchInterval: ACTIVE_TTL,
    queryFn: async ({ signal }: { signal: AbortSignal }) => parseLeaderCategory(await fetchJson(`/api/leaders/${year}/${seasonType}/${stat}`, signal, 'Additional stats')),
  })) })
  const triple = extras[0]?.data
  const threes = extras[1]?.data
  const data = useMemo(() => {
    if (!base.data) return undefined
    const additional: Leaders['categories'] = [triple, threes].filter(category => category !== undefined)
    return { ...base.data, categories: [...base.data.categories.filter(category => !additional.some(extra => extra.name === category.name)), ...additional] }
  }, [base.data, triple, threes])
  return { ...base, data, extrasError: extras.some(query => query.error) }
}
