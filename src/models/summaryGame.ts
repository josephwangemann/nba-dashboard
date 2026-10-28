import type { Summary } from './boxScore.ts'
import type { Game } from './scoreboard.ts'
import { getTeamLogo } from './teamLogo.ts'

export const gameFromSummary = (gameId: string, summary?: Summary): Game | undefined => {
  const competition = summary?.header?.competitions[0]
  const away = competition?.competitors.find(team => team.homeAway === 'away')
  const home = competition?.competitors.find(team => team.homeAway === 'home')
  if (!away || !home) return undefined
  const score = (value: string) => Number.isFinite(Number(value)) ? Number(value) : 0
  const team = (entry: typeof away) => ({
    teamId: Number(entry.team.id), teamName: entry.team.name ?? entry.team.displayName,
    teamCity: entry.team.location ?? '', score: score(entry.score), logo: getTeamLogo(entry.team),
  })
  const venue = summary?.gameInfo?.venue
  const status = competition?.status?.type
  const startsAt = Date.parse(competition?.date ?? '')
  return {
    gameId, state: status?.state ?? '', statusName: status?.name, startsAt: Number.isFinite(startsAt) ? startsAt : undefined,
    gameStatusText: status?.name === 'STATUS_SCHEDULED' && Number.isFinite(startsAt)
      ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(startsAt)
      : status?.detail ?? '',
    venue: [venue?.fullName, [venue?.address?.city, venue?.address?.state].filter(Boolean).join(', ')].filter(Boolean).join(' · '),
    awayTeam: team(away), homeTeam: team(home),
  }
}
