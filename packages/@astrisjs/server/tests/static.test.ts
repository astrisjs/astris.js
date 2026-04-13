import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { serveStatic } from '../src/static'

const publicDir = join(import.meta.dir, 'test-public')

beforeAll(async () => {
  await mkdir(publicDir, { recursive: true })
  await writeFile(join(publicDir, 'hello.txt'), 'hello world')
})

afterAll(async () => {
  await rm(publicDir, { force: true, recursive: true })
})

describe('serveStatic', () => {
  it('returns file content when file exists', async () => {
    const response = await serveStatic('/hello.txt', publicDir)
    expect(response).not.toBeNull()
    expect(await response!.text()).toBe('hello world')
  })

  it('returns null when file does not exist', async () => {
    const response = await serveStatic('/missing.txt', publicDir)
    expect(response).toBeNull()
  })
})
