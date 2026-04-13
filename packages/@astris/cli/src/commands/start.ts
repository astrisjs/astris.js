// packages/@astris/cli/src/commands/start.ts
import { join } from 'node:path'
import { createServer } from '@astris/server'
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
  })

  consola.success(`Server running at http://${hostname}:${server.port}`)
}
