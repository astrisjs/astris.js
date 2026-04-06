import { describe, expect, it } from 'bun:test'
import type { RouteEntry } from '@astris/types'
import { generateRoutesRegistry } from '../src/codegen'

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
