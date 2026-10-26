export const ACTIVE_TTL = 5 * 60 * 1000
const SETTLE_BUFFER = 15 * 60 * 1000
const SCHEDULE_TTL = 6 * 60 * 60 * 1000

export type ScheduledGame = { id: string; startsAt: number; completed: boolean; state: string; name: string }
export type Freshness = { freshUntil: number; finalIds: string; finalsObservedAt: number }

export const parseSchedule = (value: unknown): ScheduledGame[] => {
  const feed = value as { events?: { id?: string; date?: string; status?: { type?: { state?: string; name?: string; completed?: boolean } } }[] } | null
  if (!Array.isArray(feed?.events)) throw new Error('Unexpected schedule response')
  return feed.events.map(event => {
    const startsAt = Date.parse(event.date ?? '')
    const status = event.status?.type
    if (!event.id || !Number.isFinite(startsAt) || !status?.state || !status.name) throw new Error('Unexpected game status')
    return { id: event.id, startsAt, completed: status.completed === true, state: status.state, name: status.name }
  })
}

export const standingsFreshness = (games: ScheduledGame[], now: number, previous?: Freshness): Freshness => {
  const finalIds = games.filter(game => game.completed).map(game => game.id).sort().join(',')
  const finalsObservedAt = previous?.finalIds === finalIds ? previous.finalsObservedAt : now
  const unsettled = games.some(game => !game.completed && !['STATUS_POSTPONED', 'STATUS_CANCELED', 'STATUS_CANCELLED'].includes(game.name) && (game.state === 'in' || game.startsAt <= now))
  const nextStart = Math.min(...games.filter(game => !game.completed && game.startsAt > now && game.name === 'STATUS_SCHEDULED').map(game => game.startsAt))
  const settling = finalIds !== '' && now < finalsObservedAt + SETTLE_BUFFER
  return {
    finalIds,
    finalsObservedAt,
    freshUntil: unsettled || settling ? now + ACTIVE_TTL : Math.min(nextStart, now + SCHEDULE_TTL),
  }
}

export const scheduleDates = (now: number): string[] => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (name: string) => parts.find(item => item.type === name)!.value
  const day = Date.parse(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`)
  return [-1, 0, 1].map(offset => new Date(day + offset * 86400000).toISOString().slice(0, 10).replaceAll('-', ''))
}
