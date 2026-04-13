// packages/@astris/web/src/client.ts
// Browser-only: bundled by @astris/web bundle() and served as /_astris/client.js
import { createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { deserializeState, HYDRATION_STATE_ID } from './hydration'

async function hydrate() {
  const stateScript = document.getElementById(HYDRATION_STATE_ID)
  const state = deserializeState(stateScript?.textContent ?? null)

  // TODO: Replace this with a generated static import map from routes registry.
  // Bun.build cannot statically analyse computed import paths.
  // For now this serves as the architectural placeholder.
  const pathname = window.location.pathname
  const routePath = pathname === '/' ? '' : pathname
  // biome-ignore lint/security/noGlobalEval: placeholder until generated entry is implemented
  const mod = await eval(`import('/src/routes${routePath}/page.tsx')`) as { default?: unknown }
  const PageComponent = mod.default

  if (typeof PageComponent !== 'function') {
    console.error('[astris] No default export found for', pathname)
    return
  }

  hydrateRoot(
    document.getElementById('__astris_root__') ?? document.body,
    createElement(PageComponent as Parameters<typeof createElement>[0], state as Record<string, unknown>),
  )
}

hydrate()
