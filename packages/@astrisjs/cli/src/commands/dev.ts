import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateClientEntry, generateRoutesRegistry, scanRoutes } from '@astrisjs/core'

export async function runCodegen(routesDir: string, genDir: string) {
  const result = await scanRoutes(routesDir)
  const { content: routesContent } = generateRoutesRegistry(result.routes)
  const { content: clientEntryContent } = generateClientEntry(result.routes)
  await Promise.all([
    writeFile(join(genDir, 'routes.ts'), routesContent),
    writeFile(join(genDir, 'client-entry.ts'), clientEntryContent),
  ])
}
