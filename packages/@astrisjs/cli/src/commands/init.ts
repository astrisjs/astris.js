import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { __VERSION__ } from '@astrisjs/core'
export interface InitCommandConfig {
  readonly projectName: string
  readonly projectPath: string
  readonly templateUrl: URL
  readonly installDependencies: boolean
}

export async function initApp(config: InitCommandConfig) {
  const { projectName, projectPath, templateUrl, installDependencies } = config

  if (existsSync(projectPath)) {
    await rm(projectPath, { force: true, recursive: true })
  }

  await mkdir(projectPath, { recursive: true })

  const cloneProcess = Bun.spawn({
    cmd: ['git', 'clone', templateUrl.href, projectPath],
    stdout: 'ignore',
    stderr: 'pipe',
  })

  const cloneExitCode = await cloneProcess.exited

  if (cloneExitCode !== 0) {
    await rm(projectPath, { force: true, recursive: true })
    throw new Error(
      `Unable to clone template from: ${templateUrl}. Make sure you have git installed and the URL is correct.`
    )
  }

  await rm(join(projectPath, '.git'), { force: true, recursive: true })

  const packageJsonPath = join(projectPath, 'package.json')

  if (existsSync(packageJsonPath)) {
    const rawPackage = await readFile(packageJsonPath, 'utf-8')
    const parsedPackage = JSON.parse(rawPackage)

    parsedPackage.name = projectName
    parsedPackage.version = '0.0.0'

    if (parsedPackage.dependencies?.['@astris/web']) {
      parsedPackage.dependencies['@astris/web'] = __VERSION__
    }

    await writeFile(packageJsonPath, JSON.stringify(parsedPackage, null, 2))
  } else {
    throw new Error('Template is invalid: Missing package.json')
  }

  if (installDependencies) {
    const installProcess = Bun.spawn({
      cmd: ['bun', 'install'],
      cwd: projectPath,
      stdout: 'ignore',
      stderr: 'ignore',
    })

    const installExitCode = await installProcess.exited

    if (installExitCode !== 0) {
      throw new Error('Unable to install dependencies with bun.')
    }
  }
}
