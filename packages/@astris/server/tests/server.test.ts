import { describe, expect, it } from 'bun:test'
import type { RequestContext, ServerConfig } from '../src'

describe('ServerConfig', () => {
  it('accepts valid config', () => {
    const config: ServerConfig = {
      port: 3000,
      hostname: 'localhost',
      routesDir: './src/routes',
      publicDir: './public',
    }
    expect(config.port).toBe(3000)
  })
})

describe('RequestContext', () => {
  it('accepts valid context', () => {
    const ctx: RequestContext = {
      url: new URL('http://localhost:3000/users/1'),
      headers: new Headers(),
      params: { id: '1' },
    }
    expect(ctx.params.id).toBe('1')
  })
})
