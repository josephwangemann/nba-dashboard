import ProfileLink from '../shared/ProfileLink'
import { useGameSummary } from '../../api/queries'
import type { Game } from '../../models/scoreboard'
import BoxScore from './BoxScore'

type Props = { game: Game }

const Injuries = ({ game }: Props) => {
  const { data: summary, error } = useGameSummary(game.gameId)
  if (error && !summary) return <p className="notice" role="alert">Unable to load injuries. {error.message}</p>
  if (!summary) return <p className="notice" role="status">Loading injuries…</p>
  const state = summary.header?.competitions?.[0]?.status?.type?.state
  if (state && state !== 'pre') return <BoxScore gameId={game.gameId} />

  return <section aria-label="Injury report">
    <h3 className="box-title">INJURIES</h3>
    {error && <p className="notice" role="alert">Unable to refresh injuries. Showing cached results. {error.message}</p>}
    {[game.awayTeam, game.homeTeam].map(team => {
      const report = summary.injuries?.find(entry => entry.team.id === String(team.teamId))
      return <section className="team-box" key={team.teamId}>
        <h4><ProfileLink type="team" id={team.teamId}>{team.teamCity} {team.teamName}</ProfileLink></h4>
        {!report?.injuries?.length ? <p className="injury-empty">No injuries reported.</p> : <ul className="injury-list">
          {report.injuries.map(injury => <li key={injury.athlete.id}>
            <div className="injury-player"><strong><ProfileLink type="player" id={injury.athlete.id}>{injury.athlete.displayName}</ProfileLink></strong><span className="injury-status">{injury.status ?? 'Status unavailable'}</span></div>
            <p>{[injury.details?.side, injury.details?.type, injury.details?.detail].filter(Boolean).join(' · ') || 'Details unavailable'}</p>
          </li>)}
        </ul>}
      </section>
    })}
  </section>
}

export default Injuries
