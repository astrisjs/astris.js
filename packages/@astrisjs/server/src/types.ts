import type { RouteEntry } from '@astris/core'

export interface RequestContext {
  url: URL
  headers: Headers
  params: Record<string, string | string[]>
  route?: RouteEntry
}

export interface ServerConfig {
  port: number
  hostname: string
  routesDir: string
  publicDir: string
  /**
   * Optional page renderer. When provided, the server delegates page routes
   * to this function instead of returning 501.
   */
  renderer?: (ctx: RequestContext) => Promise<ReadableStream>
}
