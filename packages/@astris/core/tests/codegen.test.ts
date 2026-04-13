import { describe, expect, it } from 'bun:test'
import type { RouteEntry } from '../src'
import { generateClientEntry, generateRoutesRegistry } from '../src/codegen'

describe('generateClientEntry', () => {
  it('generates static imports for each page route', () => {
    const routes: RouteEntry[] = [
      {
        path: '/',
        pageFile: '/project/src/routes/page.tsx',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
      {
        path: '/about',
        pageFile: '/project/src/routes/about/page.tsx',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
      {
        path: '/api/hello',
        apiFile: '/project/src/routes/api/hello/route.ts',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
    ]

    const result = generateClientEntry(routes)

    expect(result.content).toContain('import("/project/src/routes/page.tsx")')
    expect(result.content).toContain('import("/project/src/routes/about/page.tsx")')
    expect(result.content).toContain('"/"')
    expect(result.content).toContain('"/about"')
    // API-only routes should not be included
    expect(result.content).not.toContain('/api/hello')
    expect(result.content).toContain('hydrate(')
  })

  it('generates valid entry for dynamic routes', () => {
    const routes: RouteEntry[] = [
      {
        path: '/users/[id]',
        pageFile: '/project/src/routes/users/[id]/page.tsx',
        params: ['id'],
        isDynamic: true,
        isCatchAll: false,
      },
    ]

    const result = generateClientEntry(routes)

    expect(result.content).toContain('"/users/[id]"')
    expect(result.content).toContain('import("/project/src/routes/users/[id]/page.tsx")')
  })
})

describe('Code generation', () => {
  it('must generate a valid route record', () => {
    const routes: RouteEntry[] = [
      {
        path: '/',
        pageFile: 'src/routes/page.tsx',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
      {
        path: '/users/[id]',
        pageFile: 'src/routes/users/[id]/page.tsx',
        apiFile: 'src/routes/users/[id]/route.ts',
        params: ['id'],
        isDynamic: true,
        isCatchAll: false,
      },
    ]

    const result = generateRoutesRegistry(routes)

    expect(result.content).toContain('export const routes')
    expect(result.content).toContain('"/": {')
    expect(result.content).toContain('"/users/[id]": {')
  })
})
