import TeamLogo from '../shared/TeamLogo'
import type { Game } from '../../models/scoreboard'

type Props = { game: Game; onSelect: (game: Game) => void; favoriteTeams: string[] }

const GameCard = ({ game, onSelect, favoriteTeams }: Props) => (
  <button className="game-card" aria-label={`View ${game.awayTeam.teamName} at ${game.homeTeam.teamName} details`} onClick={() => onSelect(game)}>
    <span className="team-row"><span className="team-identity"><TeamLogo src={game.awayTeam.logo} size={36} /><span className="team-copy"><span className="team-city">{game.awayTeam.teamCity}</span><span className="team-name">{game.awayTeam.teamName}{favoriteTeams.includes(String(game.awayTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.awayTeam.score}</strong></span>
    <span className="team-row"><span className="team-identity"><TeamLogo src={game.homeTeam.logo} size={36} /><span className="team-copy"><span className="team-city">{game.homeTeam.teamCity}</span><span className="team-name">{game.homeTeam.teamName}{favoriteTeams.includes(String(game.homeTeam.teamId)) && <span className="favorite-indicator" role="img" aria-label="Favorite team">★</span>}</span></span></span><strong>{game.homeTeam.score}</strong></span>
    <small><span className="game-status">{game.gameStatusText}</span>{game.venue && <span className="game-venue">{game.venue}</span>}</small>
  </button>
)

export default GameCard
