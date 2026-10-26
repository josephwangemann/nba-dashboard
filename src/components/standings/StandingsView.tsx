import { useStandings } from '../../api/queries'

const StandingsView = () => {
  const { data, error } = useStandings()

  if (error && !data) return <p className="notice" role="alert">{error.message}</p>
  if (!data) return <p className="notice" role="status">Loading standings…</p>
  if (!data.conferences.some(conference => conference.teams.length)) return <p className="notice">Standings are not available yet.</p>

  return <section aria-label="League standings">
    {error && <p className="notice" role="alert">Unable to refresh standings. Showing cached results. {error.message}</p>}
    <p className="standings-season">{data.season} REGULAR SEASON</p>
    {data.conferences.map(conference => <section className="team-box standings-conference" key={conference.name}>
      <h3>{conference.name}</h3>
      {conference.teams.length === 0 ? <p className="notice">No standings available.</p> : <div className="stat-scroll" tabIndex={0} role="region" aria-label={`${conference.name} standings`}>
        <table>
          <caption className="sr-only">{conference.name} standings</caption>
          <thead><tr><th scope="col">TEAM</th><th scope="col">W</th><th scope="col">L</th><th scope="col">PCT</th><th scope="col">GB</th><th scope="col">STRK</th></tr></thead>
          <tbody>{conference.teams.map(team => <tr key={team.id}>
            <th scope="row"><span className="standing-rank">{team.rank || '—'}</span>{team.name}</th>
            <td>{team.wins}</td><td>{team.losses}</td><td>{team.percentage}</td><td>{team.gamesBehind}</td><td>{team.streak}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>)}
  </section>
}

export default StandingsView
