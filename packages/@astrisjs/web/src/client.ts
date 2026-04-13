// packages/@astris/web/src/client.ts
// Exports hydrate() for use by the generated client entry (.gen/client-entry.ts).
// Never import this file directly in app code — use the generated entry instead.
import { type ComponentType, createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { deserializeState, HYDRATION_STATE_ID } from './hydration'

type PageModule = () => Promise<{ default: unknown }>

export async function hydrate(
  pageModules: Record<string, PageModule>,
  pathname = window.location.pathname
): Promise<void> {
  const loader = pageModules[pathname]

  if (!loader) {
    console.error(`[astris] No client module registered for "${pathname}"`)
    return
  }

  const mod = await loader()
  const PageComponent = mod.default

  if (typeof PageComponent !== 'function') {
    console.error('[astris] No default export found for', pathname)
    return
  }

  const stateScript = document.getElementById(HYDRATION_STATE_ID)
  const state = deserializeState(stateScript?.textContent ?? null)

  hydrateRoot(
    document.getElementById('__astris_root__') ?? document.body,
    createElement(
      PageComponent as ComponentType<Record<string, unknown>>,
      state as Record<string, unknown>
    )
  )
}
