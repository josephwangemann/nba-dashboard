import { useScoreboard } from '../../api/queries'
import { goBack } from '../../navigation/router'
import GameDetails from './GameDetails'

type Props = { id: string; date: string }

const GamePage = ({ id, date }: Props) => {
  const { data, error, isPending } = useScoreboard(date, true, false)
  const game = data?.games.find(game => game.gameId === id)
  const onBack = () => goBack(`#/games?date=${date}`)
  if (game) return <GameDetails game={game} selectedDate={date} onBack={onBack} />
  return <>
    <button className="back-button" onClick={onBack}>← Back</button>
    <p className="notice" role={error ? 'alert' : 'status'}>{isPending ? 'Loading game…' : error?.message ?? 'Game not found for this date.'}</p>
  </>
}

export default GamePage
