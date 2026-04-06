import type { MatchedRoute, RouteEntry } from '@astris/types'

export class Router {
  private routes: RouteEntry[]

  public constructor(routes: RouteEntry[]) {
    this.routes = [...routes].sort((a, b) => {
      const aSpecific = b.params.length - a.params.length || b.path.length - a.path.length

      return aSpecific
    })
  }

  public match(pathname: string): MatchedRoute | null {
    for (const entry of this.routes) {
      const params = this.extractParams(pathname, entry.path)

      if (params !== null) {
        return {
          entry,
          params,
          isApi: !!entry.apiFile && !entry.pageFile,
        }
      }
    }

    return null
  }

  private patternToRegex(pattern: string): RegExp {
    let regex = pattern.replace(/[.+?${}()|]/g, '\\$&').replace(/\\/g, '\\\\')

    regex = regex.replace(/\\\[(\w+)\\\]/g, '(?<$1>[^/]+)')
    regex = regex.replace(/\\\[\\\.\\\.\\\. (\w+)\\\]/g, '(?<$1>.+)')

    return new RegExp(`^${regex}`)
  }

  private extractParams(
    pathname: string,
    pattern: string
  ): Record<string, string | string[]> | null {
    const regex = this.patternToRegex(pattern)
    const match = regex.exec(pathname)

    if (!match?.groups) return null

    const params: Record<string, string | string[]> = {}

    for (const [key, value] of Object.entries(match.groups)) {
      if (key === 'slug' && typeof value === 'string') {
        params[key] = value.split('/')
      } else {
        params[key] = value
      }
    }

    return params
  }
}
