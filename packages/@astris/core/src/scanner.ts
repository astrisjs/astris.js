import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { ScanResult } from './types'

async function walkDirectory(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await walkDirectory(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Erro ao ler diretório ${dir}:`, error)
  }

  return files
}

function extractRoutePath(filePath: string, routesDir: string): string | null {
  const rel = relative(routesDir, filePath)
  const parts = rel.split(/[/\\]/)
  const routeParts = parts.slice(0, -1)

  if (routeParts.length === 0) return '/'
  return `/${routeParts.join('/')}`
}

function extractParams(routePath: string): string[] {
  const paramRegex = /\[\.\.\.(\w+)\]|\[(\w+)\]/g
  const params: string[] = []

  for (const match of routePath.matchAll(paramRegex)) {
    const paramName = match[1] || match[2]
    params.push(paramName)
  }

  return params
}

const isDynamicRoute = (routePath: string) => /\[[\w.]+\]/.test(routePath)

const isCatchAllRoute = (routePath: string) => /\[\.\.\./.test(routePath)

export async function scanRoutes(routesDir: string): Promise<ScanResult> {
  const result: ScanResult = {
    routes: [],
    errors: [],
  }

  const files = await walkDirectory(routesDir)
  const routeMap = new Map<string, { page?: string; api?: string }>()

  for (const filePath of files) {
    const isPage = filePath.endsWith('page.tsx') || filePath.endsWith('page.jsx')
    const isApi = filePath.endsWith('route.ts') || filePath.endsWith('route.js')

    if (!isPage && !isApi) continue

    const routePath = extractRoutePath(filePath, routesDir)
    if (!routePath) continue

    if (!routeMap.has(routePath)) {
      routeMap.set(routePath, {})
    }

    const entry = routeMap.get(routePath)
    if (!entry) {
      result.errors.push(`Unable to locate entry: ${entry}`)
      continue
    }
    if (isPage) {
      entry.page = filePath
    } else if (isApi) {
      entry.api = filePath
    }
  }

  for (const [path, { page, api }] of routeMap.entries()) {
    if (!page && !api) continue

    const params = extractParams(path)

    result.routes.push({
      path,
      pageFile: page,
      apiFile: api,
      params,
      isDynamic: isDynamicRoute(path),
      isCatchAll: isCatchAllRoute(path),
    })
  }

  return result
}
