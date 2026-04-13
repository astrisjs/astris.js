import { describe, expect, it } from 'bun:test'
import type { BundleOptions, PageProps, RenderContext } from '../src'

describe('RenderContext', () => {
  it('accepts valid context', () => {
    const ctx: RenderContext = {
      route: {
        path: '/',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
      params: {},
      url: new URL('http://localhost:3000/'),
      headers: new Headers(),
    }
    expect(ctx.route.path).toBe('/')
  })
})

describe('PageProps', () => {
  it('accepts valid props', () => {
    const props: PageProps = {
      params: { id: '1' },
      searchParams: { q: 'test' },
    }
    expect(props.params.id).toBe('1')
  })
})

describe('BundleOptions', () => {
  it('accepts valid options', () => {
    const opts: BundleOptions = {
      outdir: './dist/client',
      watch: false,
      minify: true,
    }
    expect(opts.outdir).toBe('./dist/client')
  })
})
