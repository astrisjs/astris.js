// packages/@astris/cli/src/commands/build.ts
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateClientEntry, generateRoutesRegistry, scanRoutes } from '@astris/core'
import { bundle } from '@astris/web'
import type { BuildCommandConfig } from '../type'
import consola from '../utils/consola'

export async function buildApp(config: BuildCommandConfig) {
  const { projectRoot = process.cwd() } = config

  const routesDir = join(projectRoot, 'src/routes')
  const publicDir = join(projectRoot, 'public')
  const genDir = join(projectRoot, '.gen')
  const clientOutDir = join(publicDir, '_astris')

  await mkdir(genDir, { recursive: true })
  await mkdir(clientOutDir, { recursive: true })

  consola.info('Scanning routes...')
  const result = await scanRoutes(routesDir)
  const { content: routesContent } = generateRoutesRegistry(result.routes)
  const { content: clientEntryContent } = generateClientEntry(result.routes)
  const clientEntry = join(genDir, 'client-entry.ts')
  await Promise.all([
    writeFile(join(genDir, 'routes.ts'), routesContent),
    writeFile(clientEntry, clientEntryContent),
  ])
  consola.success(`Found ${result.routes.length} routes`)

  consola.info('Bundling client...')
  await bundle({ entrypoint: clientEntry, outdir: clientOutDir, minify: true })
  consola.success('Client bundle complete')

  consola.success('Build complete!')
}
