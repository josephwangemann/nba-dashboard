import { nbaScheduleDate } from '../utils/date.ts'

export type SeasonSeries = {
  type?: string
  title?: string
  description?: string
  summary?: string
  events?: {
    id: string
    date: string
    status?: string
    competitors?: {
      homeAway: string
      score?: string
      winner?: boolean
      team: { id: string; displayName: string; abbreviation?: string }
    }[]
  }[]
}

export const headToHeadSeries = (series: SeasonSeries[] = []) => series.flatMap(item => {
  const games = (item.events ?? []).flatMap(event => {
    const date = new Date(event.date)
    const away = event.competitors?.find(team => team.homeAway === 'away')
    const home = event.competitors?.find(team => team.homeAway === 'home')
    if (!/^\d+$/.test(event.id) || !Number.isFinite(date.getTime()) || !away?.team || !home?.team) return []
    return [{ id: event.id, date, scheduleDate: nbaScheduleDate(date), state: event.status, away, home }]
  }).sort((a, b) => a.date.getTime() - b.date.getTime())
  const title = item.type === 'playoff' || /playoff|finals/i.test(item.title ?? item.description ?? '') ? 'Playoffs' : 'Regular Season Matchups'
  return games.length ? [{ title, summary: item.summary, games }] : []
})
