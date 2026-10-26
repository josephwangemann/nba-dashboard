import type { Game } from '../../models/scoreboard'

type Props = { game: Game; onSelect: (game: Game) => void }

const GameCard = ({ game, onSelect }: Props) => (
  <button className="game-card" aria-label={`View ${game.awayTeam.teamName} at ${game.homeTeam.teamName} details`} onClick={() => onSelect(game)}>
    <span className="team-row"><span><span className="team-city">{game.awayTeam.teamCity}</span><span className="team-name">{game.awayTeam.teamName}</span></span><strong>{game.awayTeam.score}</strong></span>
    <span className="team-row"><span><span className="team-city">{game.homeTeam.teamCity}</span><span className="team-name">{game.homeTeam.teamName}</span></span><strong>{game.homeTeam.score}</strong></span>
    <small><span className="game-status">{game.gameStatusText}</span>{game.venue && <span className="game-venue">{game.venue}</span>}</small>
    </button>
)

export default GameCard
