type GameStatus = { state: string; startsAt?: number; statusName?: string }
const INACTIVE = ['STATUS_POSTPONED', 'STATUS_CANCELED', 'STATUS_CANCELLED']

export const gameRefreshInterval = (games: GameStatus[], now = Date.now()): number | false => {
  const pending = games.filter(game => game.state !== 'post' && !INACTIVE.includes(game.statusName ?? ''))
  if (!pending.length) return false
  if (pending.some(game => game.state === 'in' || !game.startsAt || game.startsAt <= now)) return 30000
  return Math.max(1000, Math.min(...pending.map(game => (game.startsAt ?? now) - now), 2147483647))
}
