import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { __VERSION__ } from '@astris/core'
import type { InitCommandConfig } from '../type'
import consola from '../utils/consola'

function validateProjectName(name: string): boolean {
  if (!name || name.trim() === '') {
    consola.error('Project name is required')
    return false
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    consola.error('Project name must contain only lowercase letters, numbers, and hyphens')
    return false
  }

  return true
}

export async function initApp(config: InitCommandConfig) {
  const { projectName, templateUrl, packageManager, installDependencies } = config

  if (!validateProjectName(projectName)) return

  const projectPath = resolve(projectName)

  consola.info(`Initializing a new project named: ${projectName}`)
  consola.info(`Directory: ${projectPath}\n`)

  if (existsSync(projectPath)) {
    const override = await consola.prompt(
      `The directory ${projectPath} is not empty. Do you want to override?`,
      {
        type: 'confirm',
      }
    )

    if (!override) {
      consola.log('Cancelled.')
      return
    }
    await rm(projectPath, { force: true, recursive: true })
  }

  await mkdir(projectPath, { recursive: true })

  consola.info(`Cloning template from ${templateUrl}`)

  const cloneProcess = Bun.spawn({
    cmd: ['git', 'clone', templateUrl, projectPath],
    stdout: 'ignore',
    stderr: 'pipe',
  })

  const cloneExitCode = await cloneProcess.exited

  if (cloneExitCode !== 0) {
    consola.error(`Unable to clone template from: ${templateUrl}`)
    consola.error('Make sure you have git installed and the URL is correct.')
    await rm(projectPath, { force: true, recursive: true })
    return
  }

  await rm(join(projectPath, '.git'), { force: true, recursive: true })

  consola.success('Project directory created!')

  const packageJson = {
    name: projectName,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'astris dev',
      build: 'astris build',
      start: 'NODE_ENV=production astris start',
      lint: 'biome lint src',
      format: 'biome format src --write',
    },
    dependencies: {
      '@astris/web': __VERSION__,
    },
    devDependencies: {
      '@biomejs/biome': '^2.4.0',
      '@types/bun': '^1',
      typescript: '^6',
    },
  }

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2))

  if (installDependencies) {
    consola.info(`Installing dependencies with ${packageManager}`)
    const installProcess = Bun.spawn({
      cmd: [packageManager, 'install'],
      cwd: projectPath,
      stdout: 'ignore',
      stderr: 'ignore',
    })

    const installExitCode = await installProcess.exited

    if (installExitCode === 0) {
      consola.success('Dependencies successfully installed!')
    } else {
      consola.warn(`Unable to install dependencies with ${packageManager}`)
      config.installDependencies = false
    }
  }

  consola.success('Your project has been initialized!')
  consola.log('')
  consola.log(`📦 Project: ${projectName}`)
  consola.log(`📁 Location: ${projectPath}`)
  consola.log(`🔧 Package manager: ${packageManager}`)
  consola.log(`✨ Astris version: ${__VERSION__}`)
  consola.log('')

  const nextSteps = [
    `cd ${projectName}`,
    !config.installDependencies && `${packageManager} install`,
    `${packageManager} run dev`,
  ]
    .filter(Boolean)
    .join('\n ')

  consola.box(`Next steps:\n\n ${nextSteps}`)
  consola.log('💖 Thanks for using AstrisJS!')
}
