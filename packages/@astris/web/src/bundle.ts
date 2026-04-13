import type { BundleOptions } from './types'

async function runBuild(entrypoint: string, outdir: string, minify: boolean): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    target: 'browser',
    format: 'esm',
    minify,
    naming: 'client.js',
  })

  if (!result.success) throw new AggregateError(result.logs, '@astris/web bundle failed')
}

export async function bundle(options: BundleOptions): Promise<void> {
  await runBuild(options.entrypoint, options.outdir, options.minify ?? false)

  if (options.watch) {
    const { watch } = await import('node:fs')
    const { dirname } = await import('node:path')

    watch(dirname(options.entrypoint), { recursive: true }, async () => {
      await runBuild(options.entrypoint, options.outdir, false)
    })
  }
}
