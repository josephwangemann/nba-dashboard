export const fetchJson = async (url: string, signal: AbortSignal, label: string): Promise<unknown> => {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${label} request failed (${response.status})`)
  return response.json()
}

