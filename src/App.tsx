import { useEffect } from 'react'
import BrowseView from './components/navigation/BrowseView'
import GamePage from './components/games/GamePage'
import PlayerProfile from './components/profiles/PlayerProfile'
import SiteHeader from './components/shared/SiteHeader'
import TeamProfile from './components/profiles/TeamProfile'
import { navigate, useAppRoute } from './navigation/router'
import type { AppRoute } from './navigation/routes'
import { today } from './utils/date'
import './styles/App.css'

type RouteContentProps = { route: AppRoute }

const RouteContent = ({ route }: RouteContentProps) => {
  switch (route.type) {
    case 'player':
      return <PlayerProfile key={`player-${route.id}`} id={route.id} />
    case 'team':
      return <TeamProfile key={`team-${route.id}`} id={route.id} />
    case 'game':
      return <GamePage id={route.id} date={route.date} />
    default:
      return <BrowseView route={route} />
  }
}

const App = () => {
  const route = useAppRoute()

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])

  useEffect(() => {
    window.scrollTo(0, window.history.state?.returnScroll ?? 0)
  }, [route.key])

  return <main>
    <SiteHeader onHome={route.type !== 'games' || route.date !== today() ? () => navigate('#') : undefined} />
    <RouteContent route={route} />
  </main>
}

export default App
