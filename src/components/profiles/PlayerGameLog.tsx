import { usePlayerGameLog } from '../../api/profiles'
import { navigate } from '../../navigation/router'
import ProfileLink from '../shared/ProfileLink'

type Props = { id: string }

const PlayerGameLog = ({ id }: Props) => {
  const { data } = usePlayerGameLog(id)
  if (!data?.length) return null
  return <section aria-label="Recent player games">
    <h3 className="box-title">RECENT GAMES</h3>
    <div className="stat-scroll" role="region" tabIndex={0} aria-label="Last ten games">
      <table><caption className="sr-only">Last ten regular-season and postseason appearances</caption>
        <thead><tr><th scope="col">DATE</th><th scope="col">OPPONENT</th><th scope="col">RESULT</th><th scope="col">MIN</th><th scope="col">PTS</th><th scope="col">REB</th><th scope="col">AST</th></tr></thead>
        <tbody>{data.map(game => {
          const href = `#/game/${game.id}?date=${game.scheduleDate}`
          return <tr key={game.id}>
            <th scope="row"><a className="profile-link" href={href} aria-label={`View game against ${game.opponent} on ${new Date(game.date).toLocaleDateString()}`} onClick={event => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              navigate(href)
            }}>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(game.date))}</a></th>
            <td>{game.opponentId ? <ProfileLink type="team" id={game.opponentId}>{game.opponent}</ProfileLink> : game.opponent}</td>
            <td>{game.result} {game.score}</td><td>{game.minutes}</td><td>{game.points}</td><td>{game.rebounds}</td><td>{game.assists}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  </section>
}

export default PlayerGameLog
