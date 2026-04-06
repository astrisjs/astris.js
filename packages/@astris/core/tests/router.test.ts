import { describe, expect, it } from 'bun:test'
import type { RouteEntry } from '@astris/types'
import { Router } from '../src'

describe('Router', () => {
  const routes: RouteEntry[] = [
    {
      path: '/',
      pageFile: 'src/routes/page.tsx',
      params: [],
      isDynamic: false,
      isCatchAll: false,
    },
    {
      path: '/users',
      apiFile: 'src/routes/users/route.ts',
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

  const router = new Router(routes)

  it('must match root route', () => {
    const match = router.match('/')
    expect(match).toBeDefined()
    expect(match?.entry.path).toBe('/')
  })

  it('must match dynamic route and extract parameters.', () => {
    const match = router.match('/users/123')
    expect(match).toBeDefined()
    expect(match?.params.id).toBe('123')
  })

  it('should return null for routes not found.', () => {
    const match = router.match('/nonexistent')
    expect(match).toBeNull()
  })
})
