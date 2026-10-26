export type Leader = { id: string; name: string; team: string; teamId?: string; value: string }
export type Leaders = { season: string; categories: { name: string; label: string; abbreviation: string; players: Leader[] }[] }

type Feed = {
  requestedSeason?: { displayName?: string }
  leaders?: { categories?: { name?: string; displayName?: string; abbreviation?: string; leaders?: {
    athlete?: { id?: string; displayName?: string }
    team?: { id?: string; abbreviation?: string }
    value?: number
    displayValue?: string
  }[] }[] }
}

const formatValue = (category: string, value: number | undefined, displayValue: string | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return displayValue ?? '—'
  if (category === '3PointPct') return `${(value * 100).toFixed(1)}%`
  if (category === 'doubleDouble') return value.toFixed(0)
  return displayValue ?? String(value)
}

export const parseLeaders = (value: unknown): Leaders => {
  const feed = value as Feed | null
  if (!Array.isArray(feed?.leaders?.categories)) throw new Error('Unexpected stats response')
  return {
    season: feed.requestedSeason?.displayName ?? '',
    categories: feed.leaders.categories.map(category => {
      if (!category.name || !category.displayName) throw new Error('Missing stats category')
      return {
        name: category.name,
        label: category.displayName,
        abbreviation: category.abbreviation ?? 'STAT',
        players: (category.leaders ?? []).slice().sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity)).map(player => {
          if (!player.athlete?.id || !player.athlete.displayName) throw new Error('Missing player in stats response')
          return { id: player.athlete.id, name: player.athlete.displayName, team: player.team?.abbreviation ?? '—', teamId: player.team?.id, value: formatValue(category.name!, player.value, player.displayValue) }
        }),
      }
    }),
  }
}

export const parseExtraLeaders = (value: unknown, group: string, stat: string, label: string, abbreviation: string): Leaders['categories'][number] => {
  const feed = value as {
    categories?: { name: string; names?: string[] }[]
    athletes?: { athlete?: { id?: string; displayName?: string; teamShortName?: string; teams?: { id?: string }[] }; categories?: { name: string; totals?: string[]; values?: number[] }[] }[]
  } | null
  if (!Array.isArray(feed?.athletes) || !Array.isArray(feed.categories)) throw new Error(`Unexpected ${label.toLowerCase()} response`)
  const index = feed.categories.find(category => category.name === group)?.names?.indexOf(stat) ?? -1
  if (index < 0) throw new Error(`Missing ${label.toLowerCase()} statistics`)
  return {
    name: stat,
    label,
    abbreviation,
    players: feed.athletes.map(entry => {
      const stats = entry.categories?.find(category => category.name === group)
      const count = stats?.values?.[index]
      if (!entry.athlete?.id || !entry.athlete.displayName || typeof count !== 'number') throw new Error(`Missing ${label.toLowerCase()} player statistics`)
      return { id: entry.athlete.id, name: entry.athlete.displayName, team: entry.athlete.teamShortName ?? '—', teamId: entry.athlete.teams?.[0]?.id, value: stats?.totals?.[index] ?? String(count), count }
    }).filter(player => player.count > 0).sort((a, b) => b.count - a.count).map(({ count: _count, ...player }) => player),
  }
}
