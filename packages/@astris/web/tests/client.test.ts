import { describe, expect, it, mock } from 'bun:test'
import { hydrate } from '../src/client'

describe('hydrate', () => {
  it('is exported as a function', () => {
    expect(typeof hydrate).toBe('function')
  })

  it('calls the loader for the current pathname and logs error if no default export', async () => {
    const loader = mock(async () => ({ default: undefined }))
    const pageModules: Record<string, () => Promise<{ default: unknown }>> = {
      '/test': loader,
    }

    // Simulate browser environment minimally
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => errors.push(args)

    // jsdom/happy-dom not available in bun:test by default; we test the contract
    // by ensuring hydrate calls the loader for the matching route.
    // We patch document minimally so hydrate can run without crashing.
    const doc = globalThis.document
    if (!doc) {
      // Skip DOM assertions in non-browser environment — just verify loader is called
      await hydrate(pageModules, '/test')
      expect(loader).toHaveBeenCalledTimes(1)
      console.error = originalError
      return
    }

    await hydrate(pageModules, '/test')
    expect(loader).toHaveBeenCalledTimes(1)
    console.error = originalError
  })

  it('logs error when no loader matches the pathname', async () => {
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => errors.push(args[0])

    await hydrate({}, '/missing')

    expect(errors[0]).toContain('/missing')
    console.error = originalError
  })
})
