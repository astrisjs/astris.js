// packages/@astris/cli/src/commands/start.ts
import { join } from 'node:path'
import { createServer } from '@astris/server'
import { render } from '@astris/web'
import type { StartCommandConfig } from '../type'
import consola from '../utils/consola'

export async function startApp(config: StartCommandConfig) {
  const {
    projectRoot = process.cwd(),
    port = 3000,
    hostname = 'localhost',
  } = config

  const server = createServer({
    port,
    hostname,
    routesDir: join(projectRoot, 'src/routes'),
    publicDir: join(projectRoot, 'public'),
    renderer: async (ctx) => {
      if (!ctx.route?.pageFile) {
        return new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode('Not Found'))
            c.close()
          },
        })
      }
      const mod = await import(ctx.route.pageFile) as { default: Parameters<typeof render>[0] }
      return render(mod.default, ctx)
    },
  })

  consola.success(`Server running at http://${hostname}:${server.port}`)
}
