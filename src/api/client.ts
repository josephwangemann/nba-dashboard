export class ApiError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const shouldRetry = (failureCount: number, error: Error): boolean => {
  if (error instanceof ApiError && error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429) return false
  return failureCount < 1
}

export const fetchJson = async (url: string, signal: AbortSignal, label: string): Promise<unknown> => {
  const timeout = AbortSignal.timeout(15000)
  try {
    const response = await fetch(url, { signal: AbortSignal.any([signal, timeout]) })
    if (!response.ok) throw new ApiError(response.status === 404 ? `${label} is unavailable` : `${label} request failed (${response.status})`, response.status)
    return await response.json()
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new ApiError(`${label} request timed out. Try again.`)
    if (error instanceof ApiError) throw error
    if (error instanceof SyntaxError) throw new ApiError(`${label} returned an invalid response`)
    throw new ApiError(`Unable to connect to ${label.toLowerCase()}. Try again.`)
  }
}
