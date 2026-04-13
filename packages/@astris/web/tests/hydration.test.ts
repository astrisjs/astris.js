import { describe, expect, it } from 'bun:test'
import { deserializeState, serializeState } from '../src/hydration'

describe('serializeState', () => {
  it('produces a script tag with JSON state', () => {
    const script = serializeState({ user: { id: 1, name: 'Eric' } })
    expect(script).toContain('<script id="__ASTRIS_STATE__"')
    expect(script).toContain('"user"')
    expect(script).toContain('"Eric"')
  })

  it('escapes </script> in JSON to prevent XSS', () => {
    const script = serializeState({ html: '</script><script>alert(1)</script>' })
    expect(script).not.toContain('</script><script>')
  })
})

describe('deserializeState', () => {
  it('reads state from the DOM script tag', () => {
    const state = { count: 42 }
    // Simulate what the browser would see
    const mockScript = { textContent: JSON.stringify(state) }
    const result = deserializeState(mockScript.textContent)
    expect(result).toEqual(state)
  })

  it('returns empty object when state is missing', () => {
    const result = deserializeState(null)
    expect(result).toEqual({})
  })
})
