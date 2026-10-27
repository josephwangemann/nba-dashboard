import { updatedGame } from '../../models/boxScore'
import { useGameSummary } from '../../api/queries'
import TeamComparison from './TeamComparison'
import TeamLogo from '../shared/TeamLogo'
import { useFavoriteTeams } from '../../utils/useFavoriteTeams'
import ProfileLink from '../shared/ProfileLink'
import BoxScore from './BoxScore'
import PlayerComparison from './PlayerComparison'
import Injuries from './Injuries'
import Broadcasts from './Broadcasts'
import HeadToHead from './HeadToHead'
import type { Game } from '../../models/scoreboard'

type Props = { game: Game; selectedDate: string; onBack: () => void }

const GameDetails = ({ game: initialGame, selectedDate, onBack }: Props) => {
  const { favoriteTeams } = useFavoriteTeams()
  const { data: summary, error } = useGameSummary(initialGame.gameId)
  const game = updatedGame(initialGame, summary)
  return (
    <section className="game-detail" aria-label="Game details">
      <div className="scoreboard-bar"><h2>GAME DETAILS</h2><button className="back-button" onClick={onBack}>← Back</button></div>
      <h3 className="detail-matchup">{game.awayTeam.teamCity} {game.awayTeam.teamName} at {game.homeTeam.teamCity} {game.homeTeam.teamName}</h3>
      <p className="detail-date">{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</p>
      <div className="detail-score">
        <div className="team-row"><span className="team-identity"><TeamLogo src={game.awayTeam.logo} size={40} /><span className="team-copy"><span className="team-city">AWAY · {game.awayTeam.teamCity}</span><span className="team-name"><ProfileLink type="team" id={game.awayTeam.teamId}>{game.awayTeam.teamName}</ProfileLink>{favoriteTeams.includes(String(game.awayTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.awayTeam.score}</strong></div>
        <div className="team-row"><span className="team-identity"><TeamLogo src={game.homeTeam.logo} size={40} /><span className="team-copy"><span className="team-city">HOME · {game.homeTeam.teamCity}</span><span className="team-name"><ProfileLink type="team" id={game.homeTeam.teamId}>{game.homeTeam.teamName}</ProfileLink>{favoriteTeams.includes(String(game.homeTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.homeTeam.score}</strong></div>
        <small><span className="game-status">{game.gameStatusText}</span><span className="game-venue">{game.venue || 'Venue to be announced'}</span></small>
      </div>
      <Broadcasts game={game} />
      {error && <p className="notice" role="alert">Unable to refresh game details. {error.message}</p>}
      {!summary && !error && <p className="notice" role="status">Loading game details…</p>}
      {summary && (game.state === 'pre' ? <Injuries game={game} summary={summary} /> : <>
        <BoxScore summary={summary} />
        <TeamComparison summary={summary} />
        <PlayerComparison summary={summary} game={game} />
      </>)}
      {summary && <HeadToHead summary={summary} gameId={game.gameId} />}
    </section>
  )
}

export default GameDetails
