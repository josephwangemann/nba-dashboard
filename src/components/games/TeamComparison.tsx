import type { Summary } from '../../models/boxScore'
import ProfileLink from '../shared/ProfileLink'

type Props = { summary: Summary }
const stats = [
  ['fieldGoalPct', 'Field Goal %'], ['threePointFieldGoalPct', '3-Point %'], ['freeThrowPct', 'Free Throw %'],
  ['totalRebounds', 'Rebounds'], ['offensiveRebounds', 'Offensive Rebounds'], ['assists', 'Assists'],
  ['totalTurnovers', 'Turnovers'], ['steals', 'Steals'], ['blocks', 'Blocks'], ['pointsInPaint', 'Points in the Paint'],
] as const

const TeamComparison = ({ summary }: Props) => {
  const competitors = summary.header?.competitions?.[0]?.competitors ?? []
  const teams = ['away', 'home'].map(side => {
    const id = competitors.find(team => team.homeAway === side)?.team.id
    return summary.boxscore?.teams?.find(team => team.team.id === id)
  })
  const [away, home] = teams
  if (!away || !home) return null
  const rows = stats.filter(([name]) => teams.some(team => team?.statistics.some(stat => stat.name === name && stat.displayValue !== undefined)))
  if (!rows.length) return null
  return <section aria-label="Team comparison">
    <h3 className="box-title">TEAM COMPARISON</h3>
    <div className="stat-scroll" role="region" tabIndex={0} aria-label="Team statistics comparison">
      <table><caption className="sr-only">Away and home team statistics</caption>
        <thead><tr><th scope="col">STAT</th>{[away, home].map(team => <th scope="col" key={team.team.id}><ProfileLink type="team" id={team.team.id}>{team.team.displayName}</ProfileLink></th>)}</tr></thead>
        <tbody>{rows.map(([name, label]) => <tr key={name}><th scope="row">{label}</th>{[away, home].map(team => <td key={team.team.id}>{team.statistics.find(stat => stat.name === name)?.displayValue ?? '—'}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>
}

export default TeamComparison
