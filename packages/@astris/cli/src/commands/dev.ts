// packages/@astris/cli/src/commands/dev.ts
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateClientEntry, generateRoutesRegistry, scanRoutes } from '@astris/core'
import { startDevServer } from '@astris/server'
import { bundle, render } from '@astris/web'
import type { DevCommandConfig } from '../type'
import consola from '../utils/consola'

export async function startDev(config: DevCommandConfig) {
  const {
    projectRoot = process.cwd(),
    port = 3000,
    hostname = 'localhost',
    open = true,
  } = config

  const routesDir = join(projectRoot, 'src/routes')
  const publicDir = join(projectRoot, 'public')
  const genDir = join(projectRoot, '.gen')
  const clientOutDir = join(publicDir, '_astris')

  await mkdir(genDir, { recursive: true })
  await mkdir(clientOutDir, { recursive: true })

  consola.info('Scanning routes...')
  await runCodegen(routesDir, genDir)

  const clientEntry = join(genDir, 'client-entry.ts')

  consola.info('Bundling client...')
  bundle({ entrypoint: clientEntry, outdir: clientOutDir, watch: true, minify: false }).catch((err) => {
    consola.error('Client bundle error:', err)
  })

  consola.info('Starting dev server...')
  const server = await startDevServer({
    port,
    hostname,
    routesDir,
    publicDir,
    renderer: async (ctx) => {
      if (!ctx.route?.pageFile) {
        return new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('Not Found')); c.close() } })
      }
      const mod = await import(ctx.route.pageFile) as { default: Parameters<typeof render>[0] }
      return render(mod.default, ctx)
    },
  })

  const url = `http://${hostname}:${server.port}`
  consola.success(`Server running at ${url}`)

  if (open) {
    Bun.spawn(['open', url], { stdout: 'ignore', stderr: 'ignore' })
  }

  // Re-run codegen when route files change
  const { watch } = await import('node:fs')
  watch(routesDir, { recursive: true }, async (_event, filename) => {
    if (filename?.endsWith('route.ts') || filename?.endsWith('page.tsx')) {
      consola.info('Routes changed, regenerating...')
      await runCodegen(routesDir, genDir)
    }
  })

  process.on('SIGINT', () => {
    server.stop()
    process.exit(0)
  })
}

async function runCodegen(routesDir: string, genDir: string) {
  const result = await scanRoutes(routesDir)
  const { content: routesContent } = generateRoutesRegistry(result.routes)
  const { content: clientEntryContent } = generateClientEntry(result.routes)
  await Promise.all([
    writeFile(join(genDir, 'routes.ts'), routesContent),
    writeFile(join(genDir, 'client-entry.ts'), clientEntryContent),
  ])
}
