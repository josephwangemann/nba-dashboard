import TeamLogo from '../shared/TeamLogo'
import { useFavoriteTeams } from '../../preferences/useFavoriteTeams'
import ProfileLink from '../shared/ProfileLink'
import BoxScore from './BoxScore'
import Injuries from './Injuries'
import type { Game } from '../../models/scoreboard'

type Props = { game: Game; selectedDate: string; onBack: () => void }

const GameDetails = ({ game, selectedDate, onBack }: Props) => {
  const { favoriteTeams } = useFavoriteTeams()
  return (
    <section className="game-detail" aria-label="Game details">
      <div className="scoreboard-bar"><h2>GAME DETAILS</h2><button className="back-button" onClick={onBack}>← Back to scoreboard</button></div>
      <h3 className="detail-matchup">{game.awayTeam.teamCity} {game.awayTeam.teamName} at {game.homeTeam.teamCity} {game.homeTeam.teamName}</h3>
      <p className="detail-date">{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</p>
      <div className="detail-score">
        <div className="team-row"><span className="team-identity"><TeamLogo src={game.awayTeam.logo} size={40} /><span className="team-copy"><span className="team-city">AWAY · {game.awayTeam.teamCity}</span><span className="team-name"><ProfileLink type="team" id={game.awayTeam.teamId}>{game.awayTeam.teamName}</ProfileLink>{favoriteTeams.includes(String(game.awayTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.awayTeam.score}</strong></div>
        <div className="team-row"><span className="team-identity"><TeamLogo src={game.homeTeam.logo} size={40} /><span className="team-copy"><span className="team-city">HOME · {game.homeTeam.teamCity}</span><span className="team-name"><ProfileLink type="team" id={game.homeTeam.teamId}>{game.homeTeam.teamName}</ProfileLink>{favoriteTeams.includes(String(game.homeTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.homeTeam.score}</strong></div>
        <small><span className="game-status">{game.gameStatusText}</span><span className="game-venue">{game.venue || 'Venue to be announced'}</span></small>
      </div>
      {game.state === 'pre' ? <Injuries key={game.gameId} game={game} /> : <BoxScore key={game.gameId} gameId={game.gameId} />}
    </section>
  )
}

export default GameDetails
