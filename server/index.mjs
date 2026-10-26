import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleEspnRequest } from './espnProxy.ts'

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }

createServer(async (req, res) => {
  try {
    if (await handleEspnRequest(req, res)) return
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
    if (pathname.startsWith('/api/')) {
      res.writeHead(404)
      res.end()
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      res.end()
      return
    }
    const path = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`)
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403)
      res.end()
      return
    }
    try {
      if (!(await stat(path)).isFile()) throw new Error('Not a file')
    } catch {
      res.writeHead(404)
      res.end()
      return
    }
    const body = await readFile(path)
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(req.method === 'HEAD' ? undefined : body)
  } catch {
    res.writeHead(500)
    res.end('Unable to serve request')
  }
}).listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '127.0.0.1', () => {
  console.log(`Nothing But Net listening on port ${process.env.PORT ?? 3000}`)
})
