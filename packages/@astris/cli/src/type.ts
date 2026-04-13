export interface InitCommandConfig {
  projectName: string
  templateUrl: URL
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  installDependencies: boolean
}

export interface DevCommandConfig {
  projectRoot?: string
  port?: number
  hostname?: string
  open?: boolean
}

export interface BuildCommandConfig {
  projectRoot?: string
}

export interface StartCommandConfig {
  projectRoot?: string
  port?: number
  hostname?: string
}
