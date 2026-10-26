import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import { handleEspnRequest } from './server/espnProxy.ts'

const teamApi = (): Plugin => {
  const configure = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      void handleEspnRequest(req, res).then(handled => { if (!handled) next() }).catch(next)
    })
  }
  return { name: 'espn-team-api', configureServer: configure, configurePreviewServer: configure }
}

export default defineConfig({
  plugins: [react(), teamApi()],
  server: {
    host: '127.0.0.1',
  },
})
