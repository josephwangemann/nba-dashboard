import { useScoreboard } from '../../api/queries'
import { navigate } from '../../navigation/router'
import type { AppRoute } from '../../navigation/routes'
import ScoreboardView from '../games/ScoreboardView'
import DatePicker from '../shared/DatePicker'
import StandingsView from '../standings/StandingsView'
import StatsView from '../stats/StatsView'
import TeamsView from '../teams/TeamsView'

type Tab = 'games' | 'standings' | 'stats' | 'teams'
type Props = { route: AppRoute & { type: Tab } }
const tabs: Tab[] = ['games', 'standings', 'stats', 'teams']

const BrowseView = ({ route }: Props) => {
  const { data, error, isPending } = useScoreboard(route.date, route.type === 'games')
  let content
  switch (route.type) {
    case 'standings':
      content = <StandingsView />
      break
    case 'stats':
      content = <StatsView />
      break
    case 'teams':
      content = <TeamsView />
      break
    default:
      content = <>
        {data && error && <p className="notice" role="alert">Unable to refresh scores. Showing cached results. {error.message}</p>}
        <ScoreboardView data={data ?? null} loading={isPending} error={data ? '' : error?.message ?? ''} onSelectGame={game => navigate(`#/game/${game.gameId}?date=${route.date}`)} />
      </>
  }
  return <>
    <div className="scoreboard-bar view-bar">
      {route.type === 'games' && <DatePicker selectedDate={route.date} onDateChange={date => {
        if (date !== route.date) navigate(`#/games?date=${date}`)
      }} />}
      <nav className="view-tabs" aria-label="NBA views">
        {tabs.map(tab => <button key={tab} type="button" aria-pressed={route.type === tab} onClick={() => {
          if (route.type !== tab) navigate(`#/${tab}?date=${route.date}`)
        }}>{tab.toUpperCase()}</button>)}
      </nav>
    </div>
    {content}
  </>
}

export default BrowseView
