import packageJson from '../package.json' with { type: 'json' }

export { parseRoute } from './ast-parser'
export { generateApiClient, generateRoutesRegistry } from './codegen'
export { Router } from './router'
export { scanRoutes } from './scanner'
export { createServer } from './server'

export const __VERSION__ = packageJson.version
