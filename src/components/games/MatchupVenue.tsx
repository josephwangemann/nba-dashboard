import { useScoreboard } from '../../api/queries'

type Props = { gameId: string; date: string }

const MatchupVenue = ({ gameId, date }: Props) => {
  const { data, isPending } = useScoreboard(date, true, false)
  const venue = data?.games.find(game => game.gameId === gameId)?.venue
  return <>{venue || (isPending ? 'Loading venue…' : 'Venue unavailable')}</>
}

export default MatchupVenue
