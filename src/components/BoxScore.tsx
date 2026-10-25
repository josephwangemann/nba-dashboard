import { useEffect, useState } from 'react'

type Player = {
  athlete: { id: string; displayName: string; position?: { abbreviation: string } }
  starter?: boolean
  didNotPlay?: boolean
  reason?: string
  stats: string[]
}
type Stats = { labels: string[]; descriptions?: string[]; athletes: Player[]; totals?: string[] }
type TeamStats = { team: { id: string; displayName: string }; statistics: Stats[] }
type Summary = {
  boxscore?: { players?: TeamStats[] }
  header?: { competitions: { competitors: {
    homeAway: string
    team: { id: string; displayName: string }
    score: string
    linescores?: { displayValue: string }[]
  }[] }[] }
}

const BoxScore = ({ gameId }: { gameId: string }) => {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${encodeURIComponent(gameId)}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Box score request failed (${response.status})`)
        return response.json()
      })
      .then(result => {
        if (!result || typeof result !== 'object' || (!result.header && !result.boxscore)) throw new Error('Unexpected box score response')
        if (!controller.signal.aborted) setSummary(result)
      })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load box score') })
    return () => controller.abort()
  }, [gameId])

  if (error) return <p className="notice" role="alert">{error}</p>
  if (!summary) return <p className="notice" role="status">Loading box score…</p>
  const teams = summary.boxscore?.players?.filter(team => team.statistics.some(stats => stats.athletes?.length)) ?? []
  const competitors = [...(summary.header?.competitions?.[0]?.competitors ?? [])].sort((a, b) => (a.homeAway === 'away' ? 0 : 1) - (b.homeAway === 'away' ? 0 : 1))
  const periods = Math.max(0, ...competitors.map(team => team.linescores?.length ?? 0))
  return <section className="box-score" aria-label="Box score">
    {periods > 0 && <div className="stat-scroll" tabIndex={0} role="region" aria-label="Scoring by quarter">
      <table><caption className="sr-only">Scoring by quarter</caption><thead><tr><th scope="col">TEAM</th>{Array.from({ length: periods }, (_, index) => <th scope="col" key={index}>{index < 4 ? `Q${index + 1}` : `OT${index - 3}`}</th>)}<th scope="col">TOTAL</th></tr></thead>
        <tbody>{competitors.map(team => <tr key={team.team.id}><th scope="row">{team.team.displayName}</th>{Array.from({ length: periods }, (_, index) => <td key={index}>{team.linescores?.[index]?.displayValue ?? '—'}</td>)}<td>{team.score}</td></tr>)}</tbody>
      </table>
    </div>}
    <h3 className="box-title">BOX SCORE</h3>
    {teams.length === 0 ? <p className="notice">Player stats will appear here when available.</p> : teams.map(team => <section className="team-box" key={team.team.id}>
      <h4>{team.team.displayName}</h4>
      {team.statistics.filter(stats => stats.athletes?.length).map((stats, index) => <div className="stat-scroll" tabIndex={0} role="region" aria-label={`${team.team.displayName} player statistics`} key={index}>
        <table><caption className="sr-only">{team.team.displayName} player statistics</caption>
          <thead><tr><th scope="col">PLAYER</th>{stats.labels.map((label, i) => <th scope="col" key={i} title={stats.descriptions?.[i]}>{label}</th>)}</tr></thead>
          <tbody>{stats.athletes.map(player => <tr key={player.athlete.id}>
            <th scope="row">{player.athlete.displayName}<span className="player-position">{player.athlete.position?.abbreviation}{player.starter ? ' · Starter' : ''}</span></th>
            {player.didNotPlay ? <td colSpan={stats.labels.length} className="dnp">DNP{player.reason ? ` · ${player.reason}` : ''}</td> : stats.labels.map((_, i) => <td key={i}>{player.stats?.[i] || '—'}</td>)}
          </tr>)}</tbody>
          {stats.totals?.length ? <tfoot><tr><th scope="row">TOTAL</th>{stats.labels.map((_, i) => <td key={i}>{stats.totals?.[i] || '—'}</td>)}</tr></tfoot> : null}
        </table>
      </div>)}
    </section>)}
  </section>
}

export default BoxScore
