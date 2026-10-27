import { useState } from 'react'
import type { Summary } from '../../models/boxScore'
import type { Game } from '../../models/scoreboard'
import { playerComparisonValue } from '../../models/playerComparison'
import ProfileLink from '../shared/ProfileLink'

type Props = { summary: Summary; game: Game }

const metrics = [
  ['PTS', 'Points'], ['AST', 'Assists'], ['REB', 'Rebounds'],
  ['STL', 'Steals'], ['BLK', 'Blocks'], ['TO', 'Turnovers'],
  ['3PT', '3-pts'], ['FG%', 'FG%'],
] as const

const PlayerComparison = ({ summary, game }: Props) => {
  const [selected, setSelected] = useState<string>('PTS')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const label = metrics.find(([key]) => key === selected)![1]
  const teams = summary.boxscore?.players ?? []
  const players = teams.flatMap((team, teamIndex) => {
    if (selectedTeam !== null && team.team.id !== selectedTeam) return []
    const seen = new Set<string>()
    return team.statistics.flatMap(group => {
      const index = group.labels.findIndex(value => value.toUpperCase() === (selected === 'FG%' ? 'FG' : selected))
      if (index < 0) return []
      return group.athletes.flatMap(player => {
        const value = playerComparisonValue(player.stats?.[index], selected)
        if (player.didNotPlay || !Number.isFinite(value) || value <= 0 || seen.has(player.athlete.id)) return []
        seen.add(player.athlete.id)
        return [{ ...player.athlete, value, team: team.team, teamIndex }]
      })
    })
  }).sort((a, b) => b.value - a.value || a.displayName.localeCompare(b.displayName))
  const maximum = selected === 'FG%' ? 100 : Math.max(1, ...players.map(player => player.value))

  return <section className="player-comparison" aria-label="Player comparison">
    <h3 className="box-title">PLAYER COMPARISON</h3>
    <div className="player-chart-panel">
      <div className="player-chart-toggles" role="group" aria-label="Compare player statistics">
        {metrics.map(([key, name]) => <button key={key} aria-pressed={selected === key} onClick={() => setSelected(key)}>{name}</button>)}
      </div>
      <ul className="player-chart-legend" aria-label="Filter players by team">
        {teams.map((team, index) => <li key={team.team.id}>
          <button aria-pressed={selectedTeam === team.team.id} title={selectedTeam === team.team.id ? 'Clear team filter' : `Show only ${team.team.displayName}`} onClick={() => setSelectedTeam(current => current === team.team.id ? null : team.team.id)}>
            <span className={`player-chart-swatch chart-team-${index % 2}`} aria-hidden="true" />
            {[game.awayTeam, game.homeTeam].find(entry => String(entry.teamId) === team.team.id)?.teamName ?? team.team.displayName}
          </button>
        </li>)}
        <li><button className="player-chart-clear" aria-label="Clear team filter" title="Show both teams" style={{ visibility: selectedTeam === null ? 'hidden' : 'visible' }} onClick={() => setSelectedTeam(null)}><span aria-hidden="true">×</span></button></li>
      </ul>
      {players.length === 0 && <p className="player-chart-description" aria-live="polite">No nonzero {label.toLowerCase()} values available.</p>}
      {players.length > 0 && <ol className="player-chart" aria-label={`Players ranked by ${label.toLowerCase()}`}>
        {players.map(player => <li key={`${player.team.id}-${player.id}`}>
          <div className="player-chart-name"><ProfileLink type="player" id={player.id}>{player.displayName}</ProfileLink><span className="sr-only"> · {player.team.displayName}</span></div>
          <div className="player-chart-track" aria-hidden="true"><div className={`player-chart-bar chart-team-${player.teamIndex % 2}`} style={{ width: `${player.value / maximum * 100}%` }} /></div>
          <strong>{selected === 'FG%' ? `${Number(player.value.toFixed(1))}%` : player.value}<span className="sr-only"> {label.toLowerCase()}</span></strong>
        </li>)}
      </ol>}
    </div>
  </section>
}

export default PlayerComparison
