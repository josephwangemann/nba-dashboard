import { QueryClient, queryOptions } from '@tanstack/react-query'
import { fetchJson, shouldRetry } from './client.ts'
import { finalFreshness, observeFinal } from './finalFreshness.ts'
import { parseScoreboardData } from '../models/apiData.ts'
import { parseSummary } from '../models/summary.ts'
import type { Scoreboard } from '../models/scoreboard.ts'
import type { Summary } from '../models/boxScore.ts'

export const queryClient = new QueryClient({ defaultOptions: { queries: {
  staleTime: 30000, gcTime: 30 * 60 * 1000, retry: shouldRetry,
} } })

export const scoreboardOptions = (date: string) => queryOptions<Scoreboard>({
  queryKey: ['scoreboard', date],
  staleTime: query => finalFreshness(query.state.data?.finalObservedAt),
  queryFn: async ({ signal, client }): Promise<Scoreboard> => {
    const data = parseScoreboardData(await fetchJson(`/api/scoreboard/${date}`, signal, 'NBA'))
    const previous = client.getQueryData<Scoreboard>(['scoreboard', date])
    return { ...data, finalObservedAt: observeFinal(data.games.length > 0 && data.games.every(game => game.state === 'post'), previous?.finalObservedAt) }
  },
})
export const summaryOptions = (gameId: string) => queryOptions<Summary>({
  queryKey: ['boxScore', gameId],
  staleTime: query => finalFreshness(query.state.data?.finalObservedAt),
  queryFn: async ({ signal, client }): Promise<Summary> => {
    const data = parseSummary(await fetchJson(`/api/games/${encodeURIComponent(gameId)}`, signal, 'Game details'))
    const previous = client.getQueryData<Summary>(['boxScore', gameId])
    return { ...data, finalObservedAt: observeFinal(data.header?.competitions[0]?.status?.type?.state === 'post', previous?.finalObservedAt) }
  },
})
