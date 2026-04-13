import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { RequestContext, ServerConfig } from '../src'
import { createServer } from '../src/server'

const testRoutesDir = join(import.meta.dir, 'test-routes')

beforeAll(async () => {
  await mkdir(testRoutesDir, { recursive: true })
})

afterAll(async () => {
  await rm(testRoutesDir, { force: true, recursive: true })
})

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

describe('createServer', () => {
  it('returns a Bun server instance with a port', async () => {
    const server = createServer({
      port: 0,
      hostname: 'localhost',
      routesDir: testRoutesDir,
      publicDir: join(import.meta.dir, 'test-public'),
    })
    expect(server.port).toBeGreaterThan(0)
    server.stop(true)
  })

  it('returns 404 for unknown routes', async () => {
    const server = createServer({
      port: 0,
      hostname: 'localhost',
      routesDir: testRoutesDir,
      publicDir: join(import.meta.dir, 'test-public'),
    })
    const res = await fetch(`http://localhost:${server.port}/nonexistent`)
    expect(res.status).toBe(404)
    server.stop(true)
  })
})
