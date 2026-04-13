import { type ComponentType, createElement } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { serializeState } from './hydration'
import type { RenderContext } from './types'

const HYDRATION_SCRIPT = '<script type="module" src="/_astris/client.js"></script>'

export async function render(
  PageComponent: ComponentType<{
    params: RenderContext['params']
    searchParams: Record<string, string>
  }>,
  ctx: RenderContext
): Promise<ReadableStream> {
  const searchParams = Object.fromEntries(ctx.url.searchParams.entries())

  const element = createElement(PageComponent, {
    params: ctx.params,
    searchParams,
  })

  const stateScript = serializeState({ params: ctx.params, searchParams })

  const stream = await renderToReadableStream(element)

  return injectScripts(stream, stateScript + HYDRATION_SCRIPT)
}

async function injectScripts(stream: ReadableStream, scripts: string): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const reader = stream.getReader()
  const chunks: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(decoder.decode(value, { stream: true }))
  }

  let html = chunks.join('')
  const bodyClose = html.lastIndexOf('</body>')

  if (bodyClose !== -1) {
    html = html.slice(0, bodyClose) + scripts + html.slice(bodyClose)
  } else {
    html += scripts
  }

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(html))
      controller.close()
    },
  })
}
