import { useStandings } from '../../api/queries'
import ProfileLink from '../shared/ProfileLink'

const TeamsView = () => {
  const { data, error } = useStandings()
  if (error && !data) return <p className="notice" role="alert">{error.message}</p>
  if (!data) return <p className="notice" role="status">Loading teams…</p>

  return <section aria-label="NBA teams">
    {error && <p className="notice" role="alert">Unable to refresh teams. Showing cached results. {error.message}</p>}
    {data.conferences.map(conference => <section key={conference.name}>
      <h3 className="box-title">{conference.name}</h3>
      <ul className="teams-grid">
        {[...conference.teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => <li key={team.id}>
          <ProfileLink type="team" id={team.id}><span className="directory-team-name">{team.name}</span><span className="directory-team-record">{team.wins}–{team.losses}</span></ProfileLink>
        </li>)}
      </ul>
    </section>)}
  </section>
}

export default TeamsView
