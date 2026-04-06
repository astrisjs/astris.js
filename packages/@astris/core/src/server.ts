import type { ServerConfig } from '@astris/types'
import { Router } from './router'

export function createServer(config: ServerConfig) {
  const router = new Router(config.routes)

  return Bun.serve({
    port: config.port,
    hostname: config.hostname,

    async fetch(req: Request) {
      const url = new URL(req.url)
      const pathname = url.pathname

      const match = router.match(pathname)

      if (!match) {
        return new Response('404 Não Encontrado', { status: 404 })
      }

      return Response.json({
        matched: true,
        path: match.entry.path,
        params: match.params,
        hasPage: !!match.entry.pageFile,
        hasApi: !!match.entry.apiFile,
      })
    },
  })
}
