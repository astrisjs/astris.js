import packageJson from '../package.json' with { type: 'json' }

export { parseRoute } from './ast-parser'
export { generateApiClient, generateClientEntry, generateRoutesRegistry } from './codegen'
export { Router } from './router'
export { scanRoutes } from './scanner'
export type * from './types'

export const __VERSION__ = packageJson.version
