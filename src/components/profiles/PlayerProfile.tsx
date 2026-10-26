import { usePlayerOverview, usePlayerProfile } from '../../api/profiles'
import ProfileLink from '../shared/ProfileLink'
import ProfileHeader from './ProfileHeader'

type Props = { id: string }

const PlayerProfile = ({ id }: Props) => {
  const { data, error } = usePlayerProfile(id)
  const stats = usePlayerOverview(id)
  const athlete = data?.athlete
  const statistics = stats.data?.statistics
  const gamesPlayedIndex = statistics?.labels?.indexOf('GP') ?? -1
  const hasSeasonStats = statistics?.splits?.some(split =>
    !/career/i.test(split.displayName) && (gamesPlayedIndex >= 0
      ? Number(split.stats[gamesPlayedIndex]) > 0
      : split.stats.some(value => Number.parseFloat(value) > 0)),
  )
  return <section aria-label="Player profile">
    <ProfileHeader title="PLAYER PROFILE" />
    {error && <p className="notice" role="alert">{error.message}</p>}
    {!athlete && !error && <p className="notice" role="status">Loading player…</p>}
    {athlete && <>
      <div className="profile-hero">
        {athlete.headshot?.href && <img className="player-headshot" src={athlete.headshot.href} alt={athlete.displayName} onError={event => { event.currentTarget.hidden = true }} />}
        <div><h3 className="profile-name">{athlete.displayName}</h3>
          <p>{[athlete.jersey ? `#${athlete.jersey}` : '', athlete.position?.displayName].filter(Boolean).join(' · ')}</p>
          {athlete.team && <ProfileLink type="team" id={athlete.team.id}>{athlete.team.displayName}</ProfileLink>}
        </div>
      </div>
      <dl className="profile-facts">
        {[['Age', athlete.age], ['Height', athlete.displayHeight], ['Weight', athlete.displayWeight], ['Born', athlete.displayDOB], ['College', athlete.college?.name], ['Experience', athlete.displayExperience], ['Draft', athlete.displayDraft]].filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {hasSeasonStats && <>
        <h3 className="box-title">{data.season?.displayName} STATS</h3>
        <div className="stat-scroll" role="region" tabIndex={0} aria-label="Player season and career stats">
          <table><caption className="sr-only">Season and career averages</caption>
            <thead><tr><th scope="col">SEASON</th>{statistics?.labels?.map((label, index) => <th scope="col" title={statistics.displayNames?.[index]} key={`${label}-${index}`}>{label}</th>)}</tr></thead>
            <tbody>{statistics?.splits?.map(split => <tr key={split.displayName}><th scope="row">{split.displayName}</th>{split.stats.map((value, index) => <td key={index}>{value || '—'}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </>}
    </>}
  </section>
}

export default PlayerProfile
