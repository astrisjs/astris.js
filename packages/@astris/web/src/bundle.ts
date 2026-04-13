import { join } from 'node:path'
import type { BundleOptions } from './types'

const CLIENT_ENTRY = join(import.meta.dir, 'client.ts')

export async function bundle(options: BundleOptions): Promise<void> {
  const result = await Bun.build({
    entrypoints: [CLIENT_ENTRY],
    outdir: options.outdir,
    target: 'browser',
    format: 'esm',
    minify: options.minify ?? false,
    naming: 'client.js',
  })

  if (!result.success) throw new AggregateError(result.logs, '@astris/web bundle failed')

  if (options.watch) {
    const { watch } = await import('node:fs')

    watch(join(import.meta.dir), { recursive: true }, async () => {
      await Bun.build({
        entrypoints: [CLIENT_ENTRY],
        outdir: options.outdir,
        target: 'browser',
        format: 'esm',
        minify: false,
        naming: 'client.js',
      })
    })
  }
}
