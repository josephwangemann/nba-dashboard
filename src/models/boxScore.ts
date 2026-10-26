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
  boxscore?: { players?: TeamStats[] }
  header?: { competitions: { competitors: {
    homeAway: string
    team: { id: string; displayName: string }
    score: string
    linescores?: { displayValue: string }[]
  }[] }[] }
}

