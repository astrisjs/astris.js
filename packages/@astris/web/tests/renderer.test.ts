import { describe, expect, it } from 'bun:test'
import { createElement } from 'react'
import type { BundleOptions, PageProps, RenderContext } from '../src'
import { render } from '../src/renderer'

describe('RenderContext', () => {
  it('accepts valid context', () => {
    const ctx: RenderContext = {
      route: { path: '/', params: [], isDynamic: false, isCatchAll: false },
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

describe('render', () => {
  it('returns a ReadableStream of HTML containing the rendered component', async () => {
    const PageComponent = () => createElement('h1', null, 'Hello from SSR')

    const ctx: RenderContext = {
      route: { path: '/', params: [], isDynamic: false, isCatchAll: false },
      params: {},
      url: new URL('http://localhost:3000/'),
      headers: new Headers(),
    }

    const stream = await render(PageComponent, ctx)
    expect(stream).toBeInstanceOf(ReadableStream)

    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const html = Buffer.concat(chunks).toString()
    expect(html).toContain('Hello from SSR')
    expect(html).toContain('__ASTRIS_STATE__')
  })
})
