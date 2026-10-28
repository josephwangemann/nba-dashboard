import { object, list, optional, text, identity, finite } from './decode.ts'
import type { Scoreboard } from './scoreboard.ts'
import type { Leaders } from './leaders.ts'
import type { Standings } from './standings.ts'

const team = object({ teamId: finite, teamName: text, teamCity: text, score: finite, logo: optional(text) })
export const parseScoreboardData: (value: unknown) => Scoreboard = object({
  gameDate: text, games: list(object({ gameId: identity, state: text, startsAt: optional(finite), statusName: optional(text), gameStatusText: text, venue: text,
    homeTeam: team, awayTeam: team, broadcasts: optional(list(object({ market: text, names: list(text) }))),
  })),
})
export const parseLeaderCategory = object({ name: text, label: text, abbreviation: text, players: list(object({ id: identity, name: text, team: text, teamId: optional(identity), value: text })) })
export const parseLeadersData: (value: unknown) => Leaders = object({ season: text, seasonYear: optional(finite), seasonType: optional(finite), categories: list(parseLeaderCategory) })
export const parseStandingsData: (value: unknown) => Standings = object({ season: text, conferences: list(object({ name: text, teams: list(object({
  id: identity, name: text, logo: optional(text), rank: finite, wins: text, losses: text, percentage: text, gamesBehind: text, streak: text,
})) })) })
