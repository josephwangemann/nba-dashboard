import type { IncomingMessage, ServerResponse } from 'node:http'
import { parseScoreboard } from '../src/models/scoreboard.ts'
import { parseScoreboardData, parseStandingsData, parseLeadersData, parseLeaderCategory } from '../src/models/apiData.ts'
import { parseSummary } from '../src/models/summary.ts'
import { parseStandings } from '../src/models/standings.ts'
import { parseLeaders, parseExtraLeaders } from '../src/models/leaders.ts'
import { parsePlayerProfile, parsePlayerOverview, parseTeamProfile, parseRoster, parseTeamSchedule } from '../src/models/profiles.ts'

type Endpoint = { url: string; parse: (value: unknown) => unknown }
const site = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba'
const endpoint = (path: string): Endpoint | undefined => {
  const team = /^\/api\/teams\/(\d+)(\/(roster|schedule))?$/.exec(path)
  if (team) return { url: `${site}/teams/${team[1]}${team[2] ?? ''}`, parse: team[3] === 'roster' ? parseRoster : team[3] === 'schedule' ? parseTeamSchedule : parseTeamProfile }
  const player = /^\/api\/players\/(\d+)(\/overview)?$/.exec(path)
  if (player) return { url: `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${player[1]}${player[2] ?? ''}`, parse: player[2] ? parsePlayerOverview : parsePlayerProfile }
  const scoreboard = /^\/api\/scoreboard\/(\d{4}-\d{2}-\d{2})$/.exec(path)
  if (scoreboard) {
    const date = scoreboard[1]
    if (!Number.isFinite(Date.parse(`${date}T12:00Z`)) || new Date(`${date}T12:00Z`).toISOString().slice(0, 10) !== date) return undefined
    return { url: `${site}/scoreboard?dates=${date.replaceAll('-', '')}`, parse: value => parseScoreboardData(parseScoreboard(value, date)) }
  }
  const summary = /^\/api\/games\/(\d+)$/.exec(path)
  if (summary) return { url: `${site}/summary?event=${summary[1]}`, parse: parseSummary }
  if (path === '/api/standings') return { url: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings', parse: value => parseStandingsData(parseStandings(value)) }
  if (path === '/api/leaders') return { url: 'https://site.api.espn.com/apis/site/v3/sports/basketball/nba/leaders', parse: value => parseLeadersData(parseLeaders(value)) }
  const extra = /^\/api\/leaders\/(\d{4})\/([123])\/(tripleDouble|threePointFieldGoalsMade)$/.exec(path)
  if (extra) {
    const triple = extra[3] === 'tripleDouble'
    const group = triple ? 'general' : 'offensive'
    const params = new URLSearchParams({ limit: '10', season: extra[1], seasontype: extra[2], sort: `${group}.${extra[3]}:desc` })
    return { url: `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?${params}`, parse: value => parseLeaderCategory(parseExtraLeaders(value, group, extra[3], triple ? 'Triple Doubles' : 'Total 3-Pointers', triple ? 'TD3' : '3PM')) }
  }
}

type Result = { status: number; body: string }
type Job = { promise: Promise<Result>; controller: AbortController; users: number; settled: boolean }
const cache = new Map<string, { expires: number; result: Result }>()
const pending = new Map<string, Job>()
const TTL = 15000
const MAX_ENTRIES = 100
export const clearEspnCache = () => cache.clear()

export const handleEspnRequest = async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
  const target = endpoint((req.url ?? '').split('?')[0])
  if (!target) return false
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' })
    res.end()
    return true
  }
  const send = (result: Result, maxAge = 15) => {
    if (res.destroyed || res.writableEnded) return
    res.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': result.status === 200 ? `public, max-age=${maxAge}` : 'no-store' })
    res.end(result.body)
  }
  const cached = cache.get(target.url)
  if (cached && cached.expires > Date.now()) { send(cached.result, Math.max(0, Math.floor((cached.expires - Date.now()) / 1000))); return true }
  cache.delete(target.url)
  let job = pending.get(target.url)
  if (!job) {
    const controller = new AbortController()
    const created: Job = { controller, users: 0, settled: false, promise: Promise.resolve({ status: 502, body: '' }) }
    pending.set(target.url, created)
    created.promise = (async () => {
      try {
        const response = await fetch(target.url, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
        if (!response.ok) return { status: response.status, body: JSON.stringify({ error: 'ESPN data unavailable' }) }
        const result = { status: 200, body: JSON.stringify(target.parse(await response.json())) }
        if (!controller.signal.aborted) {
          if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!)
          cache.set(target.url, { result, expires: Date.now() + TTL })
        }
        return result
      } catch {
        return { status: 502, body: JSON.stringify({ error: 'Unable to load ESPN data' }) }
      } finally {
        created.settled = true
        if (pending.get(target.url) === created) pending.delete(target.url)
      }
    })()
    job = created
  }
  const active = job
  active.users++
  let released = false
  const release = () => {
    if (released) return
    released = true
    active.users--
    if (!active.users && !active.settled) {
      active.controller.abort()
      if (pending.get(target.url) === active) pending.delete(target.url)
    }
  }
  const onClose = () => { if (!res.writableEnded) release() }
  res.once('close', onClose)
  try { const result = await active.promise; if (!released) send(result) }
  finally { res.removeListener('close', onClose); release() }
  return true
}
