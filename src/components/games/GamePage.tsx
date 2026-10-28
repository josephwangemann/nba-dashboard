import { useGameSummary, useScoreboard } from '../../api/queries'
import { gameFromSummary } from '../../models/summaryGame'
import { nbaScheduleDate } from '../../utils/date'
import { goBack } from '../../navigation/router'
import GameDetails from './GameDetails'
import BackButton from '../shared/BackButton'

type Props = { id: string; date: string }

const GamePage = ({ id, date }: Props) => {
  const scoreboard = useScoreboard(date, true, false)
  const summary = useGameSummary(id)
  const scoreboardGame = scoreboard.data?.games.find(game => game.gameId === id)
  const game = scoreboardGame ?? gameFromSummary(id, summary.data)
  const gameDate = !scoreboardGame && game?.startsAt !== undefined ? nbaScheduleDate(new Date(game.startsAt)) : date
  const onBack = () => goBack(`#/games?date=${gameDate}`)
  if (game) return <GameDetails key={id} game={game} selectedDate={gameDate} onBack={onBack} summary={summary.data} error={summary.error} />
  const loading = scoreboard.isPending || summary.isPending
  const error = summary.error ?? scoreboard.error
  return <>
    <BackButton onClick={onBack} />
    <p className="notice" role={loading ? 'status' : 'alert'}>{loading ? 'Loading game…' : error?.message ?? 'Game not found for this date.'}</p>
  </>
}

export default GamePage
