import { fetchJson } from './client'
import { parseLeaders, parseExtraLeaders } from '../models/leaders'
import { ACTIVE_TTL, parseSchedule, scheduleDates, standingsFreshness, type Freshness } from './standingsFreshness'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { parseScoreboard } from '../models/scoreboard'
import { parseStandings } from '../models/standings'
import type { Summary } from '../models/boxScore'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
    },
  },
})

export const useScoreboard = (date: string, enabled: boolean) => useQuery({
  queryKey: ['scoreboard', date],
  enabled,
  queryFn: async ({ signal }) => parseScoreboard(await fetchJson(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date.replaceAll('-', '')}`,
    signal,
    'NBA',
  ), date),
})

export const useGameSummary = (gameId: string) => useQuery({
  queryKey: ['boxScore', gameId],
  queryFn: async ({ signal }): Promise<Summary> => {
    const result = await fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${encodeURIComponent(gameId)}`,
      signal,
      'Game details',
    )
    if (!result || typeof result !== 'object' || (!('header' in result) && !('boxscore' in result))) throw new Error('Unexpected game summary response')
    return result as Summary
  },
})

type CachedData<T> = T & { freshness: Freshness }

const useScheduledQuery = <T,>(key: string, load: (signal: AbortSignal) => Promise<T>) => useQuery<CachedData<T>>({
  queryKey: [key],
  staleTime: query => Math.max(0, (query.state.data?.freshness.freshUntil ?? 0) - query.state.dataUpdatedAt),
  gcTime: 24 * 60 * 60 * 1000,
  refetchInterval: query => query.state.status === 'error' ? ACTIVE_TTL : Math.max(1000, (query.state.data?.freshness.freshUntil ?? Date.now() + ACTIVE_TTL) - Date.now()),
  queryFn: async ({ signal }): Promise<CachedData<T>> => {
    const previous = queryClient.getQueryData<CachedData<T>>([key])
    let freshness: Freshness
    try {
      const days = await Promise.all(scheduleDates(Date.now()).map(async date => parseSchedule(await fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`,
        signal,
        'Schedule',
      ))))
      freshness = standingsFreshness(days.flat(), Date.now(), previous?.freshness)
    } catch (error) {
      if (signal.aborted) throw error
      freshness = { freshUntil: Date.now() + ACTIVE_TTL, finalIds: '', finalsObservedAt: Date.now() }
    }
    return { ...await load(signal), freshness }
  },
})

export const useStandings = () => useScheduledQuery('standings', async signal => parseStandings(await fetchJson(
  'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings', signal, 'Standings',
)))

export const useLeaders = () => useScheduledQuery('leaders', async signal => {
  const raw = await fetchJson('https://site.api.espn.com/apis/site/v3/sports/basketball/nba/leaders', signal, 'Stats')
  const leaders = parseLeaders(raw)
  const season = (raw as { requestedSeason?: { year?: number; type?: { type?: number } } }).requestedSeason
  if (!season?.year || !season.type?.type) throw new Error('Missing stats season')
  const extraCategories = await Promise.all([
    { group: 'general', stat: 'tripleDouble', label: 'Triple Doubles', abbreviation: 'TD3' },
    { group: 'offensive', stat: 'threePointFieldGoalsMade', label: 'Total 3-Pointers', abbreviation: '3PM' },
  ].map(async category => {
    const params = new URLSearchParams({ limit: '10', season: String(season.year), seasontype: String(season.type!.type), sort: `${category.group}.${category.stat}:desc` })
    const result = await fetchJson(`https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?${params}`, signal, category.label)
    return parseExtraLeaders(result, category.group, category.stat, category.label, category.abbreviation)
  }))
  return { ...leaders, categories: [...leaders.categories.filter(category => !extraCategories.some(extra => extra.name === category.name)), ...extraCategories] }
})
