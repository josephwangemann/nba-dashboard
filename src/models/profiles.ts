export type Athlete = {
  id: string
  displayName: string
  jersey?: string
  age?: number
  displayHeight?: string
  displayWeight?: string
  displayDOB?: string
  displayExperience?: string
  displayDraft?: string
  college?: { name?: string }
  headshot?: { href?: string }
  position?: { displayName?: string; abbreviation?: string }
  team?: { id: string; displayName: string }
}
export type PlayerProfile = { athlete: Athlete; season?: { displayName?: string } }
export type PlayerOverview = { statistics?: { labels?: string[]; displayNames?: string[]; splits?: { displayName: string; stats: string[] }[] } }
export type TeamProfile = { team: {
  id: string
  displayName: string
  logos?: { href: string }[]
  standingSummary?: string
  record?: { items?: { type: string; description?: string; summary?: string }[] }
} }
export type Roster = { athletes: Athlete[]; coach?: { firstName?: string; lastName?: string }[] }
export type TeamSchedule = { events: {
  id: string
  date: string
  name: string
  competitions?: {
    status?: { type?: { completed?: boolean; detail?: string } }
    competitors?: { team: { id: string; displayName: string }; score?: { displayValue?: string }; homeAway?: string; winner?: boolean }[]
  }[]
}[] }

export const parsePlayerProfile = (value: unknown): PlayerProfile => {
  const data = value as PlayerProfile | null
  if (!data?.athlete?.id || !data.athlete.displayName) throw new Error('Unexpected player profile response')
  return data
}

export const parseTeamProfile = (value: unknown): TeamProfile => {
  const data = value as TeamProfile | null
  if (!data?.team?.id || !data.team.displayName) throw new Error('Unexpected team profile response')
  return data
}

export const parseRoster = (value: unknown): Roster => {
  const data = value as Roster | null
  if (!Array.isArray(data?.athletes)) throw new Error('Unexpected roster response')
  return data
}

export const parseTeamSchedule = (value: unknown): TeamSchedule => {
  const data = value as TeamSchedule | null
  if (!Array.isArray(data?.events)) throw new Error('Unexpected team schedule response')
  return data
}

export const parsePlayerOverview = (value: unknown): PlayerOverview => {
  if (!value || typeof value !== 'object') throw new Error('Unexpected player stats response')
  return value as PlayerOverview
}
