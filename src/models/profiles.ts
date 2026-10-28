import { object, list, optional, text, identity, finite, boolean, position, teamIdentity, dateText } from './decode.ts'

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

const athlete = object({
  id: identity, displayName: text, jersey: optional(text), age: optional(finite),
  displayHeight: optional(text), displayWeight: optional(text), displayDOB: optional(text),
  displayExperience: optional(text), displayDraft: optional(text),
  college: optional(object({ name: optional(text) })), headshot: optional(object({ href: optional(text) })),
  position: optional(position), team: optional(teamIdentity),
})
export const parsePlayerProfile: (value: unknown) => PlayerProfile = object({ athlete, season: optional(object({ displayName: optional(text) })) })
export const parseTeamProfile: (value: unknown) => TeamProfile = object({ team: object({
  id: identity, displayName: text, logos: optional(list(object({ href: text }))), standingSummary: optional(text),
  record: optional(object({ items: optional(list(object({ type: text, description: optional(text), summary: optional(text) }))) })),
}) })
export const parseRoster: (value: unknown) => Roster = object({ athletes: list(athlete), coach: optional(list(object({ firstName: optional(text), lastName: optional(text) }))) })
export const parseTeamSchedule: (value: unknown) => TeamSchedule = object({ events: list(object({
  id: identity, date: dateText, name: text,
  competitions: optional(list(object({
    status: optional(object({ type: optional(object({ completed: optional(boolean), detail: optional(text) })) })),
    competitors: optional(list(object({ team: teamIdentity, score: optional(object({ displayValue: optional(text) })), homeAway: optional(text), winner: optional(boolean) }))),
  }))),
})) })
export const parsePlayerOverview: (value: unknown) => PlayerOverview = object({ statistics: optional(object({
  labels: optional(list(text)), displayNames: optional(list(text)),
  splits: optional(list(object({ displayName: text, stats: list(text) }))),
})) })
