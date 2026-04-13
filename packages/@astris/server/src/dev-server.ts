import { watch } from 'node:fs'
import { createServer } from './server'
import type { ServerConfig } from './types'

export interface DevServer {
  port: number
  stop(): void
}

export async function startDevServer(config: ServerConfig): Promise<DevServer> {
  let server = createServer(config)
  let restarting = false

  const restart = async () => {
    if (restarting) return
    restarting = true
    server.stop(true)
    server = createServer(config)
    restarting = false
    console.log(`[astris] server restarted on http://${config.hostname}:${server.port}`)
  }

  const watcher = watch(
    config.routesDir,
    {
      recursive: true,
    },
    (_event, filename) => {
      if (filename) restart()
    }
  )

  return {
    get port() {
      return Number(server.port)
    },
    stop() {
      watcher.close()
      server.stop(true)
    },
  }
}
