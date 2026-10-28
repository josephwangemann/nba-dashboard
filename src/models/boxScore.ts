import type { Game } from './scoreboard.ts'
import type { SeasonSeries } from './headToHead.ts'

type Player = {
  athlete: { id: string; displayName: string; position?: { abbreviation?: string } }
  starter?: boolean
  didNotPlay?: boolean
  reason?: string
  stats: string[]
}
type Stats = { labels: string[]; descriptions?: string[]; athletes: Player[]; totals?: string[] }
type TeamStats = { team: { id: string; displayName: string }; statistics: Stats[] }
export type Summary = {
  finalObservedAt?: number
  gameInfo?: { venue?: { fullName?: string; address?: { city?: string; state?: string } } }
  seasonseries?: SeasonSeries[]
  injuries?: {
    team: { id: string; displayName: string }
    injuries?: {
      athlete: { id: string; displayName: string; position?: { abbreviation?: string } }
      status?: string
      details?: { type?: string; detail?: string; side?: string }
    }[]
  }[]
  boxscore?: { players?: TeamStats[]; teams?: { team: { id: string; displayName: string }; statistics: { name: string; label?: string; displayValue?: string }[] }[] }
  header?: { competitions: { date?: string; status?: { type?: { state?: string; name?: string; detail?: string; completed?: boolean } }; competitors: {
    homeAway: string
    team: { id: string; displayName: string; name?: string; location?: string; logo?: string; logos?: { href: string; rel?: string[] }[] }
    score: string
    linescores?: { displayValue: string }[]
  }[] }[] }
}

export const updatedGame = (game: Game, summary?: Summary): Game => {
  const competition = summary?.header?.competitions?.[0]
  const status = competition?.status?.type
  const state = status?.state ?? game.state
  const score = (side: string, fallback: number) => {
    const value = competition?.competitors.find(team => team.homeAway === side)?.score
    return value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback
  }
  return {
    ...game,
    state,
    gameStatusText: status?.detail && (state !== 'pre' || status.name !== 'STATUS_SCHEDULED')
      ? `${state === 'in' ? 'LIVE · ' : ''}${status.detail}`
      : game.gameStatusText,
    awayTeam: { ...game.awayTeam, score: score('away', game.awayTeam.score) },
    homeTeam: { ...game.homeTeam, score: score('home', game.homeTeam.score) },
  }
}
