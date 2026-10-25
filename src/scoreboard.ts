type Team = { teamId: number; teamName: string; teamCity: string; score: number }
export type Game = { gameId: string; gameStatusText: string; venue: string; homeTeam: Team; awayTeam: Team }
export type Scoreboard = {
  gameDate: string
  games: Game[]
}

type Competitor = {
  homeAway: string
  score: string
  team: { id: string; name: string; location: string }
}
type Feed = {
  day?: { date: string }
  events: {
    id: string
    date: string
    status: { type: { name: string; detail: string } }
    competitions: {
      competitors: Competitor[]
      venue?: { fullName?: string; address?: { city?: string; state?: string } }
    }[]
  }[]
}

export function parseScoreboard(value: unknown, selectedDate?: string): Scoreboard {
  const feed = value as Feed
  const gameDate = selectedDate ?? feed?.day?.date
  if (!gameDate || !Array.isArray(feed?.events)) throw new Error('Unexpected scoreboard response')
  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  return {
    gameDate,
    games: feed.events.map(event => {
      const competitors = event.competitions[0]?.competitors
      const venue = event.competitions[0]?.venue
      const location = [venue?.address?.city, venue?.address?.state].filter(Boolean).join(', ')
      const team = (side: string): Team => {
        const competitor = competitors?.find(item => item.homeAway === side)
        if (!competitor) throw new Error('Missing team in scoreboard response')
        return {
          teamId: Number(competitor.team.id),
          teamName: competitor.team.name,
          teamCity: competitor.team.location,
          score: Number(competitor.score ?? 0),
        }
      }
      return {
        gameId: event.id,
        venue: [venue?.fullName, location].filter(Boolean).join(' · '),
        gameStatusText: event.status.type.name === 'STATUS_SCHEDULED' && Number.isFinite(Date.parse(event.date))
          ? localTime.format(new Date(event.date))
          : event.status.type.detail,
        homeTeam: team('home'),
        awayTeam: team('away'),
      }
    }),
  }
}
