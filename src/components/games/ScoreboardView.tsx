import GameCard from './GameCard'
import type { Game, Scoreboard } from '../../models/scoreboard'

type Props = {
  data: Scoreboard | null
  loading: boolean
  error: string
  onSelectGame: (game: Game) => void
}

const ScoreboardView = ({ data, loading, error, onSelectGame }: Props) => (
  <>
    {loading ? <p className="notice" role="status">Loading games…</p>
      : error ? <p className="notice" role="alert">{error}</p>
      : data && (data.games.length === 0
        ? <p className="notice">No games scheduled. Try another day.</p>
        : <ul className="games">{data.games.map(game => (
          <li key={game.gameId}><GameCard game={game} onSelect={onSelectGame} /></li>
        ))}</ul>)}
  </>
)

export default ScoreboardView
