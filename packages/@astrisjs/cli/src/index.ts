import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { __VERSION__ } from '@astrisjs/core'
import { startDevServer } from '@astrisjs/server'
import { bundle, render } from '@astrisjs/web'
import { confirm, intro, log, outro, select, spinner, text } from '@clack/prompts'
import cac from 'cac'
import { runCodegen } from './commands/dev'
import { initApp } from './commands/init'
import { parseTemplateToUrl } from './utils/format'

const cli = cac('astris')

cli
  .command('init [project-name]', 'Create a new Astris project')
  .option('--template <template>', 'The name or URL of a template on GitHub')
  .option('--no-install', 'Skip dependencies installation')
  .action(
    async (projectName: string | undefined, options: { template?: string; install: boolean }) => {
      intro('🚀 Welcome to Astris CLI!')

      let finalProjectName = projectName
      if (!finalProjectName) {
        const result = await text({
          message: 'What is the name of your project?',
          placeholder: 'my-astris-app',
          defaultValue: '.',
        })

        if (typeof result === 'symbol') process.exit(0)
        finalProjectName = result
      }

      const projectPath = resolve(finalProjectName)
      if (existsSync(projectPath)) {
        const override = await confirm({
          message: `The directory ${projectPath} is not empty. Do you want to override?`,
        })

        if (!override || typeof override === 'symbol') {
          log.info('Cancelled.')
          process.exit(0)
        }
      }

      const templateSyntaxRegex = /^(?:https?:\/\/[^\s]+|[\w-]+\/[\w.-]+)$/i
      let finalTemplateString = options.template

      if (!finalTemplateString || !templateSyntaxRegex.test(finalTemplateString)) {
        if (finalTemplateString) {
          log.warn(`Unable to find the template '${finalTemplateString}'.`)
        }

        const result = await select({
          message: 'Which template would you like to use?',
          initialValue: 'astrisjs/astris-minimal-template',
          options: [
            { label: 'Blank', value: 'astrisjs/astris-blank-template' },
            { label: 'Minimal', value: 'astrisjs/astris-minimal-template', hint: 'default' },
          ],
        })

        if (typeof result === 'symbol') process.exit(0)
        finalTemplateString = result as string
      }

      const s = spinner()
      s.start(`Creating project ${finalProjectName}`)

      try {
        await initApp({
          projectName: finalProjectName,
          projectPath,
          templateUrl: parseTemplateToUrl(finalTemplateString),
          installDependencies: options.install,
        })

        s.stop('Project directory created!')

        log.success('Your project has been initialized!\n')
        log.message(`📦 Project: ${finalProjectName}`)
        log.message(`📁 Location: ${projectPath}`)
        log.message(`✨ Astris version: ${__VERSION__}\n`)

        outro(`Next steps:\n  cd ${finalProjectName}\n  bun install\n  bun dev`)
      } catch (error) {
        s.stop('Failed to create project')
        log.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    }
  )

cli.command('dev', 'Start the AstrisJS development server').action(async () => {
  intro('🚀 Starting your AstrisJS project')
  const routesDir = join(process.cwd(), 'src/routes')
  const publicDir = join(process.cwd(), 'public')
  const genDir = join(process.cwd(), '.astrisjs')
  const clientOutDir = join(process.cwd(), '.astrisjs/output')

  await mkdir(genDir, { recursive: true })
  await mkdir(clientOutDir, { recursive: true })

  log.step('Scanning routes...')
  await runCodegen(routesDir, genDir)

  const clientEntry = join(genDir, 'client-entry.ts')

  log.step('Building client...')
  bundle({ entrypoint: clientEntry, outdir: clientOutDir, watch: true, minify: false }).catch(
    err => {
      log.error(`Client bundle error: ${err}`)
    }
  )

  log.step('Starting AstrisJS dev server...')
  const server = await startDevServer({
    port: 3000,
    hostname: 'localhost',
    routesDir,
    publicDir,
    renderer: async ctx => {
      if (!ctx.route?.pageFile) {
        return new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode('Not Found'))
            c.close()
          },
        })
      }
      const mod = (await import(ctx.route.pageFile)) as { default: Parameters<typeof render>[0] }
      return render(mod.default, ctx)
    },
  })

  log.success('Server running at http://localhost:3000')

  const { watch } = await import('node:fs')
  watch(routesDir, { recursive: true }, async (_event, filename) => {
    if (filename?.endsWith('route.ts') || filename?.endsWith('page.tsx')) {
      log.info('Routes changed, regenerating...')
      await runCodegen(routesDir, genDir)
    }
  })

  process.on('SIGINT', () => {
    server.stop()
    process.exit(0)
  })
})

cli.help()
cli.parse()
