import { Router, scanRoutes } from '@astris/core'
import { serveStatic } from './static'
import type { RequestContext, ServerConfig } from './types'

export function createServer(config: ServerConfig) {
  let router: Router | null = null

  const initRouter = async () => {
    const result = await scanRoutes(config.routesDir)
    router = new Router(result.routes)
  }

  const ready = initRouter()

  return Bun.serve({
    port: config.port,
    hostname: config.hostname,

    async fetch(req) {
      await ready

      const url = new URL(req.url)
      const pathname = url.pathname

      const staticResponse = await serveStatic(pathname, config.publicDir)
      if (staticResponse) return staticResponse

      const match = router?.match(pathname)

      if (!match) return new Response('Not Found', { status: 404 })

      if (match.entry.apiFile) {
        const method = req.method.toUpperCase()
        const mod = await import(match.entry.apiFile)
        const handler = mod[method]

        if (typeof handler !== 'function') return new Response('Method Not Allowd', { status: 405 })

        return handler(req, { params: match.params })
      }

      if (match.entry.pageFile && config.renderer) {
        const ctx: RequestContext = {
          url,
          headers: req.headers,
          params: match.params,
          route: match.entry,
        }
        const stream = await config.renderer(ctx)
        return new Response(stream, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }

      return new Response('Page rendering not configured', { status: 501 })
    },
  })
}
