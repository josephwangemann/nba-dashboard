export const playerComparisonValue = (raw: string | undefined, metric: string): number => {
  if (!raw?.trim()) return NaN
  if (metric !== '3PT' && metric !== 'FG%') return Number(raw)
  const match = /^(\d+)-(\d+)$/.exec(raw.trim())
  if (!match) return NaN
  const made = Number(match[1])
  const attempted = Number(match[2])
  if (made > attempted) return NaN
  return metric === '3PT' ? made : attempted > 0 ? made / attempted * 100 : NaN
}
