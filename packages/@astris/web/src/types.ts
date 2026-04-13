import type { RouteEntry } from '@astris/core'

export interface RenderContext {
  route: RouteEntry
  params: Record<string, string | string[]>
  url: URL
  headers: Headers
}

export interface PageProps {
  params: Record<string, string | string[]>
  searchParams: Record<string, string>
}

export interface BundleOptions {
  entrypoint: string
  outdir: string
  watch?: boolean
  minify?: boolean
}
