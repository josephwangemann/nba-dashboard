const SETTLE = 15 * 60 * 1000
export const finalFreshness = (finalObservedAt?: number, now = Date.now()): number =>
  finalObservedAt !== undefined && now >= finalObservedAt + SETTLE ? 6 * 60 * 60 * 1000 : 30000

export const observeFinal = (complete: boolean, previous?: number, now = Date.now()): number | undefined =>
  complete ? previous ?? now : undefined
