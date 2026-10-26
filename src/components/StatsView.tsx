import { useLeaders } from '../queries'

const categoryLabels: Record<string, string> = {
  doubleDouble: 'Double Doubles',
  points: 'Total Points',
  FreeThrowPct: 'Free Throw Percentage',
}

const categoryOrder = [
  'pointsPerGame', 'assistsPerGame', 'reboundsPerGame', 'stealsPerGame', 'blocksPerGame',
  'fieldGoalPercentage', 'FreeThrowPct', '3PointPct', 'PER', '3PointsMadePerGame',
  'threePointFieldGoalsMade', 'doubleDouble', 'tripleDouble', 'minutesPerGame', 'foulsPerGame',
  'points', 'NBARating', 'avgTurnovers',
]

const StatsView = () => {
  const { data, error } = useLeaders()

  if (error && !data) return <p className="notice" role="alert">{error.message}</p>
  if (!data) return <p className="notice" role="status">Loading stats…</p>
  if (!data.categories.length) return <p className="notice">Stats are not available yet.</p>

  const categories = [...data.categories].sort((a, b) => {
    const position = (name: string) => {
      const index = categoryOrder.indexOf(name)
      return index < 0 ? categoryOrder.length : index
    }
    return position(a.name) - position(b.name)
  })

  return <section aria-label="Player stats leaders">
    {error && <p className="notice" role="alert">Unable to refresh stats. Showing cached results. {error.message}</p>}
    <p className="standings-season">{data.season} REGULAR SEASON · PLAYER LEADERS</p>
    <div className="stats-grid">
      {categories.map(category => <section className="team-box standings-conference" key={category.name}>
        <h3>{categoryLabels[category.name] ?? category.label}</h3>
        {category.players.length === 0 ? <p className="notice">No leaders available.</p> : <div className="stat-scroll" tabIndex={0} role="region" aria-label={categoryLabels[category.name] ?? category.label}>
          <table>
            <caption className="sr-only">{categoryLabels[category.name] ?? category.label} leaders</caption>
            <thead><tr><th scope="col">PLAYER</th><th scope="col">TEAM</th><th scope="col">{category.abbreviation}</th></tr></thead>
            <tbody>{category.players.map((player, index) => <tr key={player.id}>
              <th scope="row"><span className="standing-rank">{index + 1}</span>{player.name}</th>
              <td>{player.team}</td><td className="leader-value">{player.value}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>)}
    </div>
  </section>
}

export default StatsView
