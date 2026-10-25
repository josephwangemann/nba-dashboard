import DatePicker from './DatePicker'
import GameCard from './GameCard'
import type { Game, Scoreboard } from '../scoreboard'

type Props = {
  selectedDate: string
  data: Scoreboard | null
  loading: boolean
  error: string
  onDateChange: (date: string) => void
  onSelectGame: (game: Game) => void
}

const ScoreboardView = ({ selectedDate, data, loading, error, onDateChange, onSelectGame }: Props) => (
  <>
    <div className="scoreboard-bar">
      <h2>THE SCOREBOARD</h2>
      <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
    </div>
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
