import { useEffect } from 'react'
import BrowseView from './components/navigation/BrowseView'
import GamePage from './components/games/GamePage'
import PlayerProfile from './components/profiles/PlayerProfile'
import SiteHeader from './components/shared/SiteHeader'
import TeamProfile from './components/profiles/TeamProfile'
import { navigate, useAppRoute } from './navigation/router'
import { today } from './utils/date'
import './styles/App.css'

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

  let content
  switch (route.type) {
    case 'player':
      content = <PlayerProfile key={`player-${route.id}`} id={route.id} />
      break
    case 'team':
      content = <TeamProfile key={`team-${route.id}`} id={route.id} />
      break
    case 'game':
      content = <GamePage id={route.id} date={route.date} />
      break
    default:
      content = <BrowseView route={route} />
  }

  return <main>
    <SiteHeader onHome={route.type !== 'games' || route.date !== today() ? () => navigate('#') : undefined} />
    {content}
  </main>
}

export default App
