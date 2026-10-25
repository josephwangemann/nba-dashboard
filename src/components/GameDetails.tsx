import BoxScore from './BoxScore'
import type { Game } from '../scoreboard'

type Props = { game: Game; selectedDate: string; onBack: () => void }

const GameDetails = ({ game, selectedDate, onBack }: Props) => (
  <section className="game-detail" aria-label="Game details">
    <div className="scoreboard-bar"><h2>GAME DETAILS</h2><button className="back-button" onClick={onBack}>← Back to scoreboard</button></div>
    <h3 className="detail-matchup">{game.awayTeam.teamCity} {game.awayTeam.teamName} at {game.homeTeam.teamCity} {game.homeTeam.teamName}</h3>
    <p className="detail-date">{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</p>
    <div className="detail-score">
      <div className="team-row"><span><span className="team-city">AWAY · {game.awayTeam.teamCity}</span><span className="team-name">{game.awayTeam.teamName}</span></span><strong>{game.awayTeam.score}</strong></div>
      <div className="team-row"><span><span className="team-city">HOME · {game.homeTeam.teamCity}</span><span className="team-name">{game.homeTeam.teamName}</span></span><strong>{game.homeTeam.score}</strong></div>
      <small><span className="game-status">{game.gameStatusText}</span><span className="game-venue">{game.venue || 'Venue to be announced'}</span></small>
    </div>
    <BoxScore key={game.gameId} gameId={game.gameId} />
  </section>
)

export default GameDetails
