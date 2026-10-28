import { object, list, listOrEmpty, optional, text, boolean, identity, dateText, teamIdentity, athleteIdentity } from './decode.ts'
import type { Summary } from './boxScore.ts'

const status = object({ state: optional(text), name: optional(text), detail: optional(text), completed: optional(boolean) })
const summaryTeam = object({
  id: identity, displayName: text, name: optional(text), location: optional(text),
  logo: optional(text), logos: optional(list(object({ href: text, rel: optional(list(text)) }))),
})
const competitor = object({ homeAway: text, team: summaryTeam, score: value => optional(text)(value) ?? '', linescores: optional(list(object({ displayValue: text }))) })
const player = object({ athlete: athleteIdentity, starter: optional(boolean), didNotPlay: optional(boolean), reason: optional(text), stats: listOrEmpty(text) })
const stats = object({ labels: listOrEmpty(text), descriptions: optional(list(text)), athletes: listOrEmpty(player), totals: optional(list(text)) })
const decodeSummary = object({
  header: optional(object({ competitions: list(object({ date: optional(dateText), status: optional(object({ type: optional(status) })), competitors: list(competitor) })) })),
  boxscore: optional(object({
    players: optional(list(object({ team: teamIdentity, statistics: list(stats) }))),
    teams: optional(list(object({ team: teamIdentity, statistics: list(object({ name: text, label: optional(text), displayValue: optional(text) })) }))),
  })),
  injuries: optional(list(object({ team: teamIdentity, injuries: optional(list(object({
    athlete: athleteIdentity, status: optional(text), details: optional(object({ type: optional(text), detail: optional(text), side: optional(text) })),
  }))) }))),
  seasonseries: optional(list(object({
    type: optional(text), title: optional(text), description: optional(text), summary: optional(text),
    events: optional(list(object({ id: identity, date: dateText, status: optional(text), competitors: optional(list(object({
      homeAway: text, score: optional(text), winner: optional(boolean), team: object({ id: identity, displayName: text, abbreviation: optional(text) }),
    }))) }))),
  }))),
  gameInfo: optional(object({ venue: optional(object({ fullName: optional(text), address: optional(object({ city: optional(text), state: optional(text) })) })) })),
})

export const parseSummary = (value: unknown): Summary => {
  const result = decodeSummary(value)
  if (!result.header && !result.boxscore) throw new Error('Unexpected game summary response')
  return result
}
