import type { Game } from '../../models/scoreboard'

type Props = { game: Game }

const Broadcasts = ({ game }: Props) => {
  if (!game.broadcasts?.length) return null
  const marketLabel = (market: string) => {
    if (market === 'national') return 'National'
    if (market === 'home') return `${game.homeTeam.teamName} market`
    if (market === 'away') return `${game.awayTeam.teamName} market`
    return 'Other listings'
  }

  return <section className="game-broadcasts" aria-label="TV and streaming">
    <h3>TV & STREAMING</h3>
    <dl>{game.broadcasts.map((broadcast, index) => <div key={`${broadcast.market}-${index}`}>
      <dt>{marketLabel(broadcast.market)}</dt>
      <dd>{broadcast.names.join(' · ')}</dd>
    </div>)}</dl>
  </section>
}

export default Broadcasts
