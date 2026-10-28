import { parsePlayerGameLog } from '../models/playerGameLog'
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from './client'
import { parsePlayerOverview, parsePlayerProfile, parseRoster, parseTeamProfile, parseTeamSchedule } from '../models/profiles'

const TEAMS = '/api/teams'
const PLAYERS = '/api/players'

export const usePlayerProfile = (id: string) => useQuery({
  queryKey: ['player', id],
  staleTime: 60 * 60 * 1000,
  queryFn: async ({ signal }) => parsePlayerProfile(await fetchJson(`${PLAYERS}/${encodeURIComponent(id)}`, signal, 'Player profile')),
})

export const usePlayerOverview = (id: string) => useQuery({
  queryKey: ['playerStats', id],
  staleTime: 5 * 60 * 1000,
  queryFn: async ({ signal }) => parsePlayerOverview(await fetchJson(`${PLAYERS}/${encodeURIComponent(id)}/overview`, signal, 'Player stats')),
})

export const useTeamProfile = (id: string) => useQuery({
  queryKey: ['team', id],
  staleTime: 5 * 60 * 1000,
  queryFn: async ({ signal }) => parseTeamProfile(await fetchJson(`${TEAMS}/${encodeURIComponent(id)}`, signal, 'Team profile')),
})

export const useTeamRoster = (id: string) => useQuery({
  queryKey: ['roster', id],
  staleTime: 60 * 60 * 1000,
  queryFn: async ({ signal }) => parseRoster(await fetchJson(`${TEAMS}/${encodeURIComponent(id)}/roster`, signal, 'Roster')),
})

export const useTeamSchedule = (id: string) => useQuery({
  queryKey: ['teamSchedule', id],
  staleTime: 5 * 60 * 1000,
  queryFn: async ({ signal }) => parseTeamSchedule(await fetchJson(`${TEAMS}/${encodeURIComponent(id)}/schedule`, signal, 'Team schedule')),
})

export const usePlayerGameLog = (id: string) => useQuery({
  queryKey: ['playerGameLog', id],
  staleTime: 5 * 60 * 1000,
  queryFn: async ({ signal }) => parsePlayerGameLog(await fetchJson(`https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${encodeURIComponent(id)}/gamelog`, signal, 'Player recent games')),
})
