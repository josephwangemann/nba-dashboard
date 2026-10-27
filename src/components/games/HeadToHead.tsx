import type { Summary } from '../../models/boxScore'
import { headToHeadSeries } from '../../models/headToHead'
import { navigate } from '../../navigation/router'
import MatchupVenue from './MatchupVenue'

type Props = { summary: Summary; gameId: string }

const HeadToHead = ({ summary, gameId }: Props) => {
  const series = headToHeadSeries(summary.seasonseries)
  if (!series.length) return null

  return <>
    {series.map((item, index) => <section className="head-to-head" aria-label={item.title} key={`${item.title}-${index}`}>
      <h3 className="box-title">{item.title.toUpperCase()}</h3>
      <div className="team-box">
        {item.summary && !/^series starts\b/i.test(item.summary.trim()) && <p className="series-summary">{item.summary}</p>}
        <div className="stat-scroll" role="region" tabIndex={0} aria-label={`${item.title} matchups`}>
          <table><caption className="sr-only">{item.title} matchups</caption>
            <thead className="sr-only"><tr><th scope="col">Date</th><th scope="col">Location and arena</th><th scope="col">Result / time</th></tr></thead>
            <tbody>{item.games.map(game => {
              const href = `#/game/${game.id}?date=${game.scheduleDate}`
              const current = game.id === gameId
              const result = game.state === 'post' || game.state === 'in'
                ? `${game.away.team.abbreviation ?? game.away.team.displayName} ${game.away.score ?? '—'} – ${game.home.score ?? '—'} ${game.home.team.abbreviation ?? game.home.team.displayName}${game.state === 'in' ? ' · Live' : ' · Final'}`
                : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(game.date)
              return <tr key={game.id} className={`schedule-game-row${current ? ' current-matchup' : ''}`} onClick={event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                if (event.target instanceof Element && event.target.closest('a')) return
                navigate(href)
              }}>
                <th scope="row"><a className="profile-link" href={href} aria-current={current ? 'page' : undefined} aria-label={`View ${game.away.team.displayName} at ${game.home.team.displayName} on ${game.scheduleDate}`} onClick={event => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  navigate(href)
                }}>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(game.date)}</a></th>
                <td className="matchup-venue"><MatchupVenue gameId={game.id} date={game.scheduleDate} /></td>
                <td>{result}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>
    </section>)}
  </>
}

export default HeadToHead
