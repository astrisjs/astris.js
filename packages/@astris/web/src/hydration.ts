const STATE_ID = '__ASTRIS_STATE__'

/**
 * Serialize server state into an HTML script tag.
 * The </script> sequence is escaped to prevent XSS injection.
 */
export function serializeState(state: unknown): string {
  const json = JSON.stringify(state).replace(/<\/script>/gi, '<\\/script>')
  return `<script id="${STATE_ID}" type="application/json">${json}</script>`
}

/**
 * Deserialize state from a JSON string (typically from a script tag's textContent).
 * Returns an empty object if the input is null or unparseable.
 */
export function deserializeState(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export const HYDRATION_STATE_ID = STATE_ID
