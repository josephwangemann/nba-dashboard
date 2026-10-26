import type { IncomingMessage, ServerResponse } from 'node:http'

export const handleEspnRequest = async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
  const match = /^\/api\/teams\/(\d+)(\/(roster|schedule))?$/.exec((req.url ?? '').split('?')[0])
  if (!match) return false
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' })
    res.end()
    return true
  }
  const controller = new AbortController()
  res.once('close', () => { if (!res.writableEnded) controller.abort() })
  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${match[1]}${match[2] ?? ''}`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
    })
    const body = await response.text()
    if (controller.signal.aborted) return true
    res.writeHead(response.status, { 'Content-Type': 'application/json', 'Cache-Control': response.ok ? 'public, max-age=60' : 'no-store' })
    res.end(body)
  } catch {
    if (!controller.signal.aborted) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unable to load ESPN team data' }))
    }
  }
  return true
}
