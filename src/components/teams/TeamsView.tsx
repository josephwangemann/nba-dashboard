import TeamLogo from '../shared/TeamLogo'
import { useFavoriteTeams } from '../../utils/useFavoriteTeams'
import { useStandings } from '../../api/queries'
import ProfileLink from '../shared/ProfileLink'

const TeamsView = () => {
  const { data, error } = useStandings()
  const { favoriteTeams } = useFavoriteTeams()
  if (error && !data) return <p className="notice" role="alert">{error.message}</p>
  if (!data) return <p className="notice" role="status">Loading teams…</p>

  return <section aria-label="NBA teams">
    {error && <p className="notice" role="alert">Unable to refresh teams. Showing cached results. {error.message}</p>}
    {data.conferences.map(conference => <section key={conference.name}>
      <h3 className="box-title">{conference.name}</h3>
      <ul className="teams-grid">
        {[...conference.teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => <li key={team.id}>
          <ProfileLink type="team" id={team.id}><span className="directory-team-name"><TeamLogo src={team.logo} size={32} />{team.name}{favoriteTeams.includes(team.id) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span><span className="directory-team-record">{team.wins}–{team.losses}</span></ProfileLink>
        </li>)}
      </ul>
    </section>)}
  </section>
}

export default TeamsView
