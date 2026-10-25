import { useEffect, useState } from 'react'
import './App.css'
import GameDetails from './components/GameDetails'
import ScoreboardView from './components/ScoreboardView'
import SiteHeader from './components/SiteHeader'
import { parseScoreboard, type Scoreboard, type Game } from './scoreboard'
import { today } from './utils/date'

const App = () => {
  const [selectedDate, setSelectedDate] = useState(today)
  const [data, setData] = useState<Scoreboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${selectedDate.replaceAll('-', '')}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`NBA request failed (${response.status})`)
        return response.json()
      })
      .then(result => {
        if (!controller.signal.aborted) setData(parseScoreboard(result, selectedDate))
      })
      .catch(reason => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load NBA data')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selectedDate])

  const handleDateChange = (date: string) => {
    setLoading(true)
    setError('')
    setSelectedDate(date)
  }

  return (
    <main>
      <SiteHeader />
      {selectedGame ? (
        <GameDetails game={selectedGame} selectedDate={selectedDate} onBack={() => setSelectedGame(null)} />
      ) : (
        <ScoreboardView
          selectedDate={selectedDate}
          data={data}
          loading={loading}
          error={error}
          onDateChange={handleDateChange}
          onSelectGame={setSelectedGame}
        />
      )}
    </main>
  )
}

export default App
