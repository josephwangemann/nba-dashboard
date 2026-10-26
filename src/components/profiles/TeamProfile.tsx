import { useFavoriteTeams } from '../../preferences/useFavoriteTeams'
import { useTeamProfile, useTeamRoster, useTeamSchedule } from '../../api/profiles'
import ProfileLink from '../shared/ProfileLink'
import ProfileHeader from './ProfileHeader'

type Props = { id: string }

const TeamProfile = ({ id }: Props) => {
  const { data, error } = useTeamProfile(id)
  const roster = useTeamRoster(id)
  const schedule = useTeamSchedule(id)
  const { favoriteTeams, toggleFavorite } = useFavoriteTeams()
  const isFavorite = favoriteTeams.includes(id)
  const team = data?.team
  return <section aria-label="Team profile">
    <ProfileHeader title="TEAM PROFILE" />
    {error && <p className="notice" role="alert">{error.message}</p>}
    {!team && !error && <p className="notice" role="status">Loading team…</p>}
    {team && <>
      <div className="profile-hero">
        {team.logos?.[0]?.href && <img className="team-logo" src={team.logos[0].href} alt="" onError={event => { event.currentTarget.hidden = true }} />}
        <div className="profile-identity">
          <div className="profile-title-row">
            <h3 className="profile-name">{team.displayName}</h3>
            <button type="button" className="favorite-team-button" aria-pressed={isFavorite} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${team.displayName} ${isFavorite ? 'from' : 'to'} favorites`} onClick={() => toggleFavorite(id)}>
              <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
            </button>
          </div>
          <p>{team.standingSummary}</p>
        </div>
      </div>
      <dl className="profile-facts">{team.record?.items?.map(record => <div key={record.type}><dt>{record.description ?? record.type}</dt><dd>{record.summary ?? '—'}</dd></div>)}</dl>
      <h3 className="box-title">ROSTER</h3>
      {roster.error && <p className="notice" role="alert">{roster.error.message}</p>}
      {!roster.data && !roster.error && <p className="notice" role="status">Loading roster…</p>}
      {roster.data && <>
        {roster.data.coach?.length ? <p>Coach: {roster.data.coach.map(coach => [coach.firstName, coach.lastName].filter(Boolean).join(' ')).join(', ')}</p> : null}
        {roster.data.athletes.length ? <div className="stat-scroll" role="region" tabIndex={0} aria-label="Team roster"><table>
          <caption className="sr-only">{team.displayName} roster</caption>
          <thead><tr><th scope="col">PLAYER</th><th scope="col">#</th><th scope="col">POS</th><th scope="col">AGE</th><th scope="col">HEIGHT</th></tr></thead>
          <tbody>{roster.data.athletes.map(player => <tr key={player.id}><th scope="row"><ProfileLink type="player" id={player.id}>{player.displayName}</ProfileLink></th><td>{player.jersey ?? '—'}</td><td>{player.position?.abbreviation ?? '—'}</td><td>{player.age ?? '—'}</td><td>{player.displayHeight ?? '—'}</td></tr>)}</tbody>
        </table></div> : <p className="notice">No roster available.</p>}
      </>}
      <h3 className="box-title">SCHEDULE & RESULTS</h3>
      {schedule.error && <p className="notice" role="alert">{schedule.error.message}</p>}
      {!schedule.data && !schedule.error && <p className="notice" role="status">Loading schedule…</p>}
      {schedule.data && (schedule.data.events.length ? <div className="stat-scroll" role="region" tabIndex={0} aria-label="Team schedule"><table>
        <caption className="sr-only">{team.displayName} schedule and results</caption>
        <thead><tr><th scope="col">OPPONENT</th><th scope="col">DATE</th><th scope="col">RESULT / TIME</th></tr></thead>
        <tbody>{schedule.data.events.map(event => {
          const competition = event.competitions?.[0]
          const opponent = competition?.competitors?.find(item => item.team.id !== id)
          const own = competition?.competitors?.find(item => item.team.id === id)
          const date = new Date(event.date)
          const validDate = Number.isFinite(date.getTime())
          return <tr key={event.id}>
            <th scope="row">{opponent ? <><span className="schedule-side">{own?.homeAway === 'home' ? 'vs ' : '@ '}</span><ProfileLink type="team" id={opponent.team.id}>{opponent.team.displayName}</ProfileLink></> : event.name}</th>
            <td>{validDate ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date) : '—'}</td>
            <td>{competition?.status?.type?.completed ? `${own?.score?.displayValue ?? '—'} – ${opponent?.score?.displayValue ?? '—'}` : validDate ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(date) : competition?.status?.type?.detail ?? 'TBD'}</td>
          </tr>
        })}</tbody>
      </table></div> : <p className="notice">No schedule available.</p>)}
    </>}
  </section>
}

export default TeamProfile
