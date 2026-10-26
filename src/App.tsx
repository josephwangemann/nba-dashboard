import { useState } from 'react'
import './App.css'
import GameDetails from './components/GameDetails'
import ScoreboardView from './components/ScoreboardView'
import SiteHeader from './components/SiteHeader'
import DatePicker from './components/DatePicker'
import StandingsView from './components/StandingsView'
import StatsView from './components/StatsView'
import type { Game } from './scoreboard'
import { useScoreboard } from './queries'
import { today } from './utils/date'

const App = () => {
  const [view, setView] = useState<'scoreboard' | 'standings' | 'stats'>('scoreboard')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const { data, error, isPending } = useScoreboard(selectedDate, view === 'scoreboard' && !selectedGame)

  return (
    <main>
      <SiteHeader />
      {selectedGame ? (
        <GameDetails game={selectedGame} selectedDate={selectedDate} onBack={() => setSelectedGame(null)} />
      ) : (
        <>
          <div className="scoreboard-bar view-bar">
            <nav className="view-tabs" aria-label="NBA views">
              <button type="button" aria-pressed={view === 'scoreboard'} onClick={() => setView('scoreboard')}>GAMES</button>
              <button type="button" aria-pressed={view === 'standings'} onClick={() => setView('standings')}>STANDINGS</button>
              <button type="button" aria-pressed={view === 'stats'} onClick={() => setView('stats')}>STATS</button>
            </nav>
            {view === 'scoreboard' && <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />}
          </div>
          {view === 'scoreboard' && data && error && <p className="notice" role="alert">Unable to refresh scores. Showing cached results. {error.message}</p>}
          {view === 'stats' ? <StatsView /> : view === 'standings' ? <StandingsView /> : <ScoreboardView
          data={data ?? null}
          loading={isPending}
          error={data ? '' : error?.message ?? ''}
          onSelectGame={setSelectedGame}
        />}
        </>
      )}
    </main>
  )
}

export default App
