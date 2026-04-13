// packages/@astris/cli/src/index.ts
import { buildApp } from './commands/build'
import { startDev } from './commands/dev'
import { initApp } from './commands/init'
import { startApp } from './commands/start'
import consola from './utils/consola'

const [,, command, ...args] = process.argv

const TEMPLATE_URL = new URL('https://github.com/freitaseric/astrisjs-template.git')

switch (command) {
  case 'init': {
    const projectName = args[0]
    if (!projectName) {
      consola.error('Usage: astris init <project-name>')
      process.exit(1)
    }
    await initApp({
      projectName,
      templateUrl: TEMPLATE_URL,
      packageManager: 'bun',
      installDependencies: true,
    })
    break
  }

  case 'dev': {
    await startDev({ projectRoot: process.cwd(), open: true })
    break
  }

  case 'build': {
    await buildApp({ projectRoot: process.cwd() })
    break
  }

  case 'start': {
    await startApp({ projectRoot: process.cwd() })
    break
  }

  default: {
    consola.log('Usage: astris <command>')
    consola.log('Commands: init, dev, build, start')
    process.exit(1)
  }
}
