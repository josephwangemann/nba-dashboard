export type RecentGame = { id: string; date: string; scheduleDate: string; opponent: string; opponentId?: string; result: string; score: string; minutes: string; points: string; rebounds: string; assists: string }

type Feed = {
  names?: string[]
  events?: Record<string, { gameDate?: string; gameResult?: string; score?: string; opponent?: { id?: string; displayName?: string } }>
  seasonTypes?: { displayName?: string; categories?: { events?: { eventId?: string; stats?: string[] }[] }[] }[]
}

const scheduleDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
})

export const parsePlayerGameLog = (value: unknown): RecentGame[] => {
  const feed = value as Feed | null
  if (!Array.isArray(feed?.seasonTypes) || !Array.isArray(feed.names) || !feed.events) throw new Error('Unexpected player game log response')
  const names = feed.names
  const games = new Map<string, RecentGame>()
  for (const season of feed.seasonTypes) {
    if (/preseason/i.test(season.displayName ?? '')) continue
    for (const category of season.categories ?? []) {
      for (const row of category.events ?? []) {
        if (!row.eventId) continue
        const event = feed.events[row.eventId]
        const date = event?.gameDate
        const timestamp = Date.parse(date ?? '')
        if (!event || !date || !Number.isFinite(timestamp) || !row.stats?.length) continue
        const stat = (name: string) => row.stats?.[names.indexOf(name)] ?? '—'
        if (!(Number.parseFloat(stat('minutes')) > 0)) continue
        const parts = scheduleDateFormatter.formatToParts(timestamp)
        const scheduleDate = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
        games.set(row.eventId, {
          id: row.eventId,
          date,
          scheduleDate,
          opponent: event.opponent?.displayName ?? 'Opponent unavailable',
          opponentId: event.opponent?.id,
          result: event.gameResult ?? '',
          score: event.score ?? '—',
          minutes: stat('minutes'), points: stat('points'), rebounds: stat('totalRebounds'), assists: stat('assists'),
        })
      }
    }
  }
  return [...games.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 10)
}
