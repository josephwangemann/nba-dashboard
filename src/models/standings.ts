import { getTeamLogo, type TeamBranding } from './teamLogo.ts'

export type Standing = { id: string; name: string; logo?: string; rank: number; wins: string; losses: string; percentage: string; gamesBehind: string; streak: string }
export type Standings = { season: string; conferences: { name: string; teams: Standing[] }[] }

type Stat = { name?: string; value?: number; displayValue?: string }
type Feed = { season?: { displayName?: string }; children?: { name?: string; standings?: { entries?: { team?: TeamBranding & { id?: string; displayName?: string }; stats?: Stat[] }[] } }[] }

export const parseStandings = (value: unknown): Standings => {
  const feed = value as Feed | null
  if (!Array.isArray(feed?.children)) throw new Error('Unexpected standings response')
  return {
    season: feed.season?.displayName ?? '',
    conferences: feed.children.map(conference => ({
      name: conference.name ?? 'Conference',
      teams: (conference.standings?.entries ?? []).map(entry => {
        if (!entry.team?.id || !entry.team.displayName) throw new Error('Missing team in standings response')
        const stat = (name: string) => entry.stats?.find(item => item.name === name)
        const display = (name: string) => stat(name)?.displayValue ?? '—'
        return {
          id: entry.team.id,
          name: entry.team.displayName,
          logo: getTeamLogo(entry.team),
          rank: stat('playoffSeed')?.value ?? 0,
          wins: display('wins'),
          losses: display('losses'),
          percentage: display('winPercent'),
          gamesBehind: display('gamesBehind'),
          streak: display('streak'),
        }
      }).sort((a, b) => a.rank - b.rank),
    })),
  }
}
