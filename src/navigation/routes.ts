export type AppRoute = { date: string } & (
  { type: 'games' | 'standings' | 'stats' | 'teams' } |
  { type: 'game' | 'player' | 'team'; id: string }
)

export const parseRoute = (hash: string, defaultDate: string): AppRoute => {
  const [path, search = ''] = hash.replace(/^#/, '').split('?')
  const requestedDate = new URLSearchParams(search).get('date')
  const parsedDate = Date.parse(`${requestedDate}T12:00:00Z`)
  const date = requestedDate && Number.isFinite(parsedDate) && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && new Date(parsedDate).toISOString().slice(0, 10) === requestedDate ? requestedDate : defaultDate
  const match = /^\/(game|player|team)\/(\d+)$/.exec(path)
  if (match) return { type: match[1] as 'game' | 'player' | 'team', id: match[2], date }
  const type = path.slice(1)
  if (type === 'games' || type === 'standings' || type === 'stats' || type === 'teams') return { type, date }
  return { type: 'games', date }
}
