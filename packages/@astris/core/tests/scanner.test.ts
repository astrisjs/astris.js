import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { scanRoutes } from '../src'

const testDir = join(import.meta.dir, 'test-routes')

beforeAll(async () => {
  await mkdir(testDir, { recursive: true })
  await mkdir(join(testDir, 'users', '[id]'), { recursive: true })
  await mkdir(join(testDir, 'api', 'posts'), { recursive: true })

  await writeFile(join(testDir, 'page.tsx'), 'export default () => <h1>Home</h1>')
  await writeFile(
    join(testDir, 'users', '[id]', 'page.tsx'),
    'export default () => <h1>Usuário</h1>'
  )
  await writeFile(join(testDir, 'users', '[id]', 'route.ts'), 'export async function GET() {}')
  await writeFile(join(testDir, 'api', 'posts', 'route.ts'), 'export async function POST() {}')
})

afterAll(async () => {
  await rm(testDir, { force: true, recursive: true })
})

describe('Route scanner', () => {
  it('must discover root page', async () => {
    const result = await scanRoutes(testDir)
    const rootRoute = result.routes.find(r => r.path === '/')

    expect(rootRoute).toBeDefined()
    expect(rootRoute?.pageFile).toContain('page.tsx')
  })
})
