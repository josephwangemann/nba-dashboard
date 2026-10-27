import ProfileLink from '../shared/ProfileLink'
import type { Summary } from '../../models/boxScore'

type Props = { summary: Summary }

const BoxScore = ({ summary }: Props) => {
  const teams = summary.boxscore?.players?.filter(team => team.statistics.some(stats => stats.athletes?.length)) ?? []
  const competitors = [...(summary.header?.competitions?.[0]?.competitors ?? [])].sort((a, b) => (a.homeAway === 'away' ? 0 : 1) - (b.homeAway === 'away' ? 0 : 1))
  const periods = Math.max(0, ...competitors.map(team => team.linescores?.length ?? 0))
  return <section className="box-score" aria-label="Box score">
    {periods > 0 && <div className="stat-scroll" tabIndex={0} role="region" aria-label="Scoring by quarter">
      <table><caption className="sr-only">Scoring by quarter</caption><thead><tr><th scope="col">TEAM</th>{Array.from({ length: periods }, (_, index) => <th scope="col" key={index}>{index < 4 ? `Q${index + 1}` : `OT${index - 3}`}</th>)}<th scope="col">TOTAL</th></tr></thead>
        <tbody>{competitors.map(team => <tr key={team.team.id}><th scope="row"><ProfileLink type="team" id={team.team.id}>{team.team.displayName}</ProfileLink></th>{Array.from({ length: periods }, (_, index) => <td key={index}>{team.linescores?.[index]?.displayValue ?? '—'}</td>)}<td>{team.score}</td></tr>)}</tbody>
      </table>
    </div>}
    <h3 className="box-title">BOX SCORE</h3>
    {teams.length === 0 ? <p className="notice">Player stats will appear here when available.</p> : teams.map(team => <section className="team-box" key={team.team.id}>
      <h4 className={`chart-team-${(summary.boxscore?.players?.findIndex(entry => entry.team.id === team.team.id) ?? 0) % 2}`}><ProfileLink type="team" id={team.team.id}>{team.team.displayName}</ProfileLink></h4>
      {team.statistics.filter(stats => stats.athletes?.length).map((stats, index) => <div className="stat-scroll" tabIndex={0} role="region" aria-label={`${team.team.displayName} player statistics`} key={index}>
        <table><caption className="sr-only">{team.team.displayName} player statistics</caption>
          <thead><tr><th scope="col">PLAYER</th>{stats.labels.map((label, i) => <th scope="col" key={i} title={stats.descriptions?.[i]}>{label}</th>)}</tr></thead>
          <tbody>{stats.athletes.map(player => <tr key={player.athlete.id}>
            <th scope="row"><ProfileLink type="player" id={player.athlete.id}>{player.athlete.displayName}</ProfileLink><span className="player-position">{player.athlete.position?.abbreviation}{player.starter ? ' · Starter' : ''}</span></th>
            {player.didNotPlay ? <td colSpan={stats.labels.length} className="dnp">DNP{player.reason ? ` · ${player.reason}` : ''}</td> : stats.labels.map((_, i) => <td key={i}>{player.stats?.[i] || '—'}</td>)}
          </tr>)}</tbody>
          {stats.totals?.length ? <tfoot><tr><th scope="row">TOTAL</th>{stats.labels.map((_, i) => <td key={i}>{stats.totals?.[i] || '—'}</td>)}</tr></tfoot> : null}
        </table>
      </div>)}
    </section>)}
  </section>
}

export default BoxScore
