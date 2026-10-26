type Player = {
  athlete: { id: string; displayName: string; position?: { abbreviation: string } }
  starter?: boolean
  didNotPlay?: boolean
  reason?: string
  stats: string[]
}
type Stats = { labels: string[]; descriptions?: string[]; athletes: Player[]; totals?: string[] }
type TeamStats = { team: { id: string; displayName: string }; statistics: Stats[] }
export type Summary = {
  injuries?: {
    team: { id: string; displayName: string }
    injuries?: {
      athlete: { id: string; displayName: string; position?: { abbreviation: string } }
      status?: string
      details?: { type?: string; detail?: string; side?: string }
    }[]
  }[]
  boxscore?: { players?: TeamStats[] }
  header?: { competitions: { status?: { type?: { state?: string } }; competitors: {
    homeAway: string
    team: { id: string; displayName: string }
    score: string
    linescores?: { displayValue: string }[]
  }[] }[] }
}

