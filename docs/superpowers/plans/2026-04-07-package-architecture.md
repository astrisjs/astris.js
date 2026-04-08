# Package Architecture Redesign — AstrisJS

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monorepo into `@astris/core` (agnostic kernel), `@astris/server` (Bun HTTP adapter), `@astris/web` (React SSR layer), and `@astris/cli` (orchestrator), eliminating `@astris/types`.

**Architecture:** Big-bang migration — all packages are restructured in a single cycle. Types move to their owner packages. `@astris/core` becomes dependency-free of Bun/React. `@astris/server` and `@astris/web` are independently swappable.

**Tech Stack:** Bun, TypeScript 6, React 19 (`renderToReadableStream`, `hydrateRoot`), Turborepo, Biome.

**Spec:** `docs/superpowers/specs/2026-04-07-package-architecture-design.md`

---

## File Map

### Delete
- `packages/@astris/types/` — entire package, types redistributed to owners

### Modify — `@astris/core`
- `packages/@astris/core/src/types.ts` — **CREATE**: all core-owned types (`RouteEntry`, `MatchedRoute`, `ParsedRoute`, `ScanResult`, `CodegenResult`, `TypeInfo`)
- `packages/@astris/core/src/index.ts` — export from `./types`; remove `createServer` export
- `packages/@astris/core/src/scanner.ts` — import types from `./types` instead of `@astris/types`
- `packages/@astris/core/src/router.ts` — import types from `./types` instead of `@astris/types`
- `packages/@astris/core/src/ast-parser.ts` — import types from `./types` instead of `@astris/types`
- `packages/@astris/core/src/codegen.ts` — import types from `./types` instead of `@astris/types`
- `packages/@astris/core/src/server.ts` — **DELETE**: Bun.serve stub moves to `@astris/server`
- `packages/@astris/core/package.json` — remove `@astris/types` from devDependencies
- `packages/@astris/core/tests/router.test.ts` — update import from `@astris/types` → `@astris/core`
- `packages/@astris/core/tests/codegen.test.ts` — update import from `@astris/types` → `@astris/core`

### Create — `@astris/server`
- `packages/@astris/server/package.json`
- `packages/@astris/server/tsconfig.json`
- `packages/@astris/server/src/types.ts` — `ServerConfig`, `RequestContext`
- `packages/@astris/server/src/static.ts` — serve files from `public/`
- `packages/@astris/server/src/server.ts` — `Bun.serve` entry point
- `packages/@astris/server/src/dev-server.ts` — importable dev module (file watching + HMR)
- `packages/@astris/server/src/index.ts` — public exports
- `packages/@astris/server/tests/server.test.ts`
- `packages/@astris/server/tests/static.test.ts`

### Create — `@astris/web`
- `packages/@astris/web/package.json`
- `packages/@astris/web/tsconfig.json`
- `packages/@astris/web/src/types.ts` — `RenderContext`, `PageProps`, `BundleOptions`
- `packages/@astris/web/src/hydration.ts` — serialize/deserialize server state
- `packages/@astris/web/src/renderer.ts` — `render(ctx: RenderContext): Promise<ReadableStream>`
- `packages/@astris/web/src/bundle.ts` — `bundle(options: BundleOptions): Promise<void>`
- `packages/@astris/web/src/client.ts` — browser entry point (`hydrateRoot`)
- `packages/@astris/web/src/index.ts` — public exports (server-side only; `client.ts` is a bundle entry point, not a re-export)
- `packages/@astris/web/tests/renderer.test.ts`
- `packages/@astris/web/tests/hydration.test.ts`

### Modify — `@astris/cli`
- `packages/@astris/cli/src/commands/dev.ts` — implement full orchestrator
- `packages/@astris/cli/src/index.ts` — wire up proper CLI (init + dev + build + start)
- `packages/@astris/cli/src/type.ts` — add `BuildCommandConfig`, `StartCommandConfig`
- `packages/@astris/cli/package.json` — add `@astris/server` and `@astris/web` as dependencies

### Modify — Monorepo
- `package.json` (root) — add `@astris/server` and `@astris/web` to workspaces glob (already covered by `packages/**`)
- `turbo.json` — no changes needed (glob already covers new packages)

---

## Chunk 1: Restructure `@astris/core`

Move types out of `@astris/types` and into `@astris/core`. Remove the Bun.serve stub. Update all imports and tests.

### Task 1: Create `@astris/core/src/types.ts`

**Files:**
- Create: `packages/@astris/core/src/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// packages/@astris/core/src/types.ts

export interface RouteEntry {
  path: string
  pageFile?: string
  apiFile?: string
  params: string[]
  isDynamic: boolean
  isCatchAll: boolean
}

export interface ScanResult {
  routes: RouteEntry[]
  errors: string[]
}

export interface TypeInfo {
  name: string
  kind: 'interface' | 'type'
  exported: boolean
  properties?: Record<string, string>
}

export interface ParsedRoute {
  filePath: string
  methods: {
    GET?: { requestType?: TypeInfo; responseType?: TypeInfo }
    POST?: { requestType?: TypeInfo; responseType?: TypeInfo }
    PUT?: { requestType?: TypeInfo; responseType?: TypeInfo }
    DELETE?: { requestType?: TypeInfo; responseType?: TypeInfo }
    PATCH?: { requestType?: TypeInfo; responseType?: TypeInfo }
  }
}

export interface CodegenResult {
  content: string
  warnings: string[]
}

export interface MatchedRoute {
  entry: RouteEntry
  params: Record<string, string | string[]>
  isApi: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/@astris/core/src/types.ts
git commit -m "feat(@astris/core): add types.ts with all core-owned types"
```

---

### Task 2: Update internal imports in `@astris/core`

**Files:**
- Modify: `packages/@astris/core/src/scanner.ts`
- Modify: `packages/@astris/core/src/router.ts`
- Modify: `packages/@astris/core/src/ast-parser.ts`
- Modify: `packages/@astris/core/src/codegen.ts`

- [ ] **Step 1: Update `scanner.ts`** — replace `import type { ScanResult } from '@astris/types'` with `import type { ScanResult } from './types'`

- [ ] **Step 2: Update `router.ts`** — replace `import type { MatchedRoute, RouteEntry } from '@astris/types'` with `import type { MatchedRoute, RouteEntry } from './types'`

- [ ] **Step 3: Update `ast-parser.ts`** — replace `import type { ParsedRoute, TypeInfo } from '@astris/types'` with `import type { ParsedRoute, TypeInfo } from './types'`

- [ ] **Step 4: Update `codegen.ts`** — replace `import type { CodegenResult, RouteEntry } from '@astris/types'` with `import type { CodegenResult, RouteEntry } from './types'`

- [ ] **Step 5: Run existing core tests**

```bash
cd packages/@astris/core && bun test tests/
```

Expected: `router.test.ts` and `codegen.test.ts` fail with "Cannot find module '@astris/types'" — this is expected. `scanner.test.ts` and `setup.test.ts` do not import from `@astris/types` and will continue to pass.

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/core/src/
git commit -m "refactor(@astris/core): import types from ./types instead of @astris/types"
```

---

### Task 3: Update `@astris/core` public API and delete `server.ts`

**Files:**
- Modify: `packages/@astris/core/src/index.ts`
- Delete: `packages/@astris/core/src/server.ts`
- Modify: `packages/@astris/core/package.json`

- [ ] **Step 1: Update `src/index.ts`**

```typescript
// packages/@astris/core/src/index.ts
import packageJson from '../package.json' with { type: 'json' }

export { parseRoute } from './ast-parser'
export { generateApiClient, generateRoutesRegistry } from './codegen'
export { Router } from './router'
export { scanRoutes } from './scanner'
export type {
  CodegenResult,
  MatchedRoute,
  ParsedRoute,
  RouteEntry,
  ScanResult,
  TypeInfo,
} from './types'

export const __VERSION__ = packageJson.version
```

- [ ] **Step 2: Delete `src/server.ts`**

```bash
rm packages/@astris/core/src/server.ts
```

- [ ] **Step 3: Clean up `package.json`**

In `packages/@astris/core/package.json`:
- Remove `"@astris/types": "workspace:*"` from `devDependencies`
- Remove `"react"` and `"react-dom"` from `dependencies`
- Remove `"@types/react"` and `"@types/react-dom"` from `devDependencies`

The spec requires `@astris/core` to have zero React dependencies.

- [ ] **Step 4: Commit**

```bash
git add packages/@astris/core/src/index.ts packages/@astris/core/package.json
git rm packages/@astris/core/src/server.ts
git commit -m "refactor(@astris/core): remove Bun.serve stub and @astris/types dependency"
```

---

### Task 4: Fix tests — update imports from `@astris/types` to `@astris/core`

**Files:**
- Modify: `packages/@astris/core/tests/router.test.ts`
- Modify: `packages/@astris/core/tests/codegen.test.ts`

- [ ] **Step 1: Update `router.test.ts`** — replace `import type { RouteEntry } from '@astris/types'` with `import type { RouteEntry } from '../src'`

- [ ] **Step 2: Update `codegen.test.ts`** — replace `import type { RouteEntry } from '@astris/types'` with `import type { RouteEntry } from '../src'`

- [ ] **Step 3: Run tests to verify they pass**

```bash
cd packages/@astris/core && bun test tests/
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/@astris/core/tests/
git commit -m "fix(@astris/core): update test imports to use @astris/core types"
```

---

## Chunk 2: Create `@astris/server`

New package: Bun HTTP adapter. Handles incoming requests, serves static assets, exposes an importable dev-server module.

### Task 5: Scaffold `@astris/server`

**Files:**
- Create: `packages/@astris/server/package.json`
- Create: `packages/@astris/server/tsconfig.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@astris/server",
  "version": "0.1.0",
  "description": "Bun HTTP adapter for AstrisJS",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --format=esm --target=bun --minify --sourcemap=linked && bunx dts-bundle-generator -o dist/index.d.ts src/index.ts",
    "test": "bun test tests/",
    "lint": "biome check src tests",
    "format": "biome format src tests --write",
    "clean": "rm -rf dist"
  },
  "keywords": ["bun", "framework", "server", "http"],
  "author": {
    "name": "Eric Freitas",
    "email": "contato@freitaseric.com",
    "url": "https://freitaseric.com"
  },
  "license": "MIT",
  "dependencies": {
    "@astris/core": "workspace:*"
  },
  "devDependencies": {
    "@types/bun": "^1.1.0",
    "@types/node": "^25.5.2"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `src/` directory**

```bash
mkdir -p packages/@astris/server/src packages/@astris/server/tests
```

- [ ] **Step 4: Commit scaffold**

```bash
git add packages/@astris/server/
git commit -m "feat(@astris/server): scaffold package"
```

---

### Task 6: Define server types

**Files:**
- Create: `packages/@astris/server/src/types.ts`

- [ ] **Step 1: Write failing test for types shape**

```typescript
// packages/@astris/server/tests/server.test.ts
import { describe, expect, it } from 'bun:test'
import type { RequestContext, ServerConfig } from '../src'

describe('ServerConfig', () => {
  it('accepts valid config', () => {
    const config: ServerConfig = {
      port: 3000,
      hostname: 'localhost',
      routesDir: './src/routes',
      publicDir: './public',
    }
    expect(config.port).toBe(3000)
  })
})

describe('RequestContext', () => {
  it('accepts valid context', () => {
    const ctx: RequestContext = {
      url: new URL('http://localhost:3000/users/1'),
      headers: new Headers(),
      params: { id: '1' },
    }
    expect(ctx.params.id).toBe('1')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/@astris/server && bun test tests/server.test.ts
```

Expected: FAIL — cannot find module `'../src'`.

- [ ] **Step 3: Create `src/types.ts`**

```typescript
// packages/@astris/server/src/types.ts
import type { RouteEntry } from '@astris/core'

export interface RequestContext {
  url: URL
  headers: Headers
  params: Record<string, string | string[]>
  route?: RouteEntry
}

export interface ServerConfig {
  port: number
  hostname: string
  routesDir: string
  publicDir: string
  /**
   * Optional page renderer. When provided, the server delegates page routes
   * to this function instead of returning 501. Injected by @astris/cli.
   * Keeping this optional ensures @astris/server is not coupled to @astris/web.
   */
  renderer?: (ctx: RequestContext) => Promise<ReadableStream>
}
```

- [ ] **Step 4: Create minimal `src/index.ts`**

```typescript
// packages/@astris/server/src/index.ts
export type { RequestContext, ServerConfig } from './types'
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
cd packages/@astris/server && bun test tests/server.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/server/src/types.ts packages/@astris/server/src/index.ts packages/@astris/server/tests/server.test.ts
git commit -m "feat(@astris/server): add ServerConfig and RequestContext types"
```

---

### Task 7: Implement static file serving

**Files:**
- Create: `packages/@astris/server/src/static.ts`
- Create: `packages/@astris/server/tests/static.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/@astris/server/tests/static.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { serveStatic } from '../src/static'

const publicDir = join(import.meta.dir, 'test-public')

beforeAll(async () => {
  await mkdir(publicDir, { recursive: true })
  await writeFile(join(publicDir, 'hello.txt'), 'hello world')
})

afterAll(async () => {
  await rm(publicDir, { force: true, recursive: true })
})

describe('serveStatic', () => {
  it('returns file content when file exists', async () => {
    const response = await serveStatic('/hello.txt', publicDir)
    expect(response).not.toBeNull()
    expect(await response!.text()).toBe('hello world')
  })

  it('returns null when file does not exist', async () => {
    const response = await serveStatic('/missing.txt', publicDir)
    expect(response).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/@astris/server && bun test tests/static.test.ts
```

Expected: FAIL — cannot find `'../src/static'`.

- [ ] **Step 3: Implement `src/static.ts`**

```typescript
// packages/@astris/server/src/static.ts
import { join } from 'node:path'

export async function serveStatic(
  pathname: string,
  publicDir: string
): Promise<Response | null> {
  const filePath = join(publicDir, pathname)
  const file = Bun.file(filePath)

  if (!(await file.exists())) return null

  return new Response(file)
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd packages/@astris/server && bun test tests/static.test.ts
```

Expected: PASS.

- [ ] **Step 5: Export from `src/index.ts`**

Add to `packages/@astris/server/src/index.ts`:
```typescript
export { serveStatic } from './static'
```

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/server/src/static.ts packages/@astris/server/src/index.ts packages/@astris/server/tests/static.test.ts
git commit -m "feat(@astris/server): implement static file serving"
```

---

### Task 8: Implement the production server

**Files:**
- Create: `packages/@astris/server/src/server.ts`

- [ ] **Step 1: Rewrite `tests/server.test.ts`**

Replace the entire file with the following (imports must be at the top — do not append to the existing file):

```typescript
// packages/@astris/server/tests/server.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { RequestContext, ServerConfig } from '../src'
import { createServer } from '../src/server'

const testRoutesDir = join(import.meta.dir, 'test-routes')

beforeAll(async () => {
  await mkdir(testRoutesDir, { recursive: true })
})

afterAll(async () => {
  await rm(testRoutesDir, { force: true, recursive: true })
})

describe('ServerConfig', () => {
  it('accepts valid config', () => {
    const config: ServerConfig = {
      port: 3000,
      hostname: 'localhost',
      routesDir: './src/routes',
      publicDir: './public',
    }
    expect(config.port).toBe(3000)
  })
})

describe('RequestContext', () => {
  it('accepts valid context', () => {
    const ctx: RequestContext = {
      url: new URL('http://localhost:3000/users/1'),
      headers: new Headers(),
      params: { id: '1' },
    }
    expect(ctx.params.id).toBe('1')
  })
})

describe('createServer', () => {
  it('returns a Bun server instance with a port', async () => {
    const server = createServer({
      port: 0,
      hostname: 'localhost',
      routesDir: testRoutesDir,
      publicDir: join(import.meta.dir, 'test-public'),
    })
    expect(server.port).toBeGreaterThan(0)
    server.stop(true)
  })

  it('returns 404 for unknown routes', async () => {
    const server = createServer({
      port: 0,
      hostname: 'localhost',
      routesDir: testRoutesDir,
      publicDir: join(import.meta.dir, 'test-public'),
    })
    const res = await fetch(`http://localhost:${server.port}/nonexistent`)
    expect(res.status).toBe(404)
    server.stop(true)
  })
})

- [ ] **Step 2: Run tests to confirm new ones fail**

```bash
cd packages/@astris/server && bun test tests/server.test.ts
```

Expected: FAIL — cannot find `'../src/server'`.

- [ ] **Step 3: Implement `src/server.ts`**

```typescript
// packages/@astris/server/src/server.ts
import { Router, scanRoutes } from '@astris/core'
import type { ServerConfig } from './types'
import { serveStatic } from './static'

export function createServer(config: ServerConfig) {
  // Routes are scanned at startup synchronously via top-level await at call site
  // For production: caller should pre-scan and pass routes if needed
  let router: Router | null = null

  const initRouter = async () => {
    const result = await scanRoutes(config.routesDir)
    router = new Router(result.routes)
  }

  // Start scanning immediately
  const ready = initRouter()

  return Bun.serve({
    port: config.port,
    hostname: config.hostname,

    async fetch(req: Request) {
      await ready

      const url = new URL(req.url)
      const pathname = url.pathname

      // Try static files first
      const staticResponse = await serveStatic(pathname, config.publicDir)
      if (staticResponse) return staticResponse

      // Match route
      const match = router!.match(pathname)

      if (!match) {
        return new Response('Not Found', { status: 404 })
      }

      // API route: import and execute handler
      if (match.entry.apiFile) {
        const method = req.method.toUpperCase()
        const mod = await import(match.entry.apiFile)
        const handler = mod[method]

        if (typeof handler !== 'function') {
          return new Response('Method Not Allowed', { status: 405 })
        }

        return handler(req, { params: match.params })
      }

      // Page route: delegate to renderer if configured
      if (match.entry.pageFile && config.renderer) {
        const ctx: RequestContext = {
          url,
          headers: req.headers,
          params: match.params,
          route: match.entry,
        }
        const stream = await config.renderer(ctx)
        return new Response(stream, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      return new Response('Page rendering not configured', { status: 501 })
    },
  })
}
```

> **Note:** `renderer` is optional in `ServerConfig`. When not provided (e.g. in tests), page routes return 501. `@astris/cli` wires the renderer in Task 15, keeping `@astris/server` decoupled from `@astris/web`.

- [ ] **Step 4: Export from `src/index.ts`**

Add to `packages/@astris/server/src/index.ts`:
```typescript
export { createServer } from './server'
```

- [ ] **Step 5: Run all server tests**

```bash
cd packages/@astris/server && bun test tests/
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/server/src/server.ts packages/@astris/server/src/index.ts packages/@astris/server/tests/
git commit -m "feat(@astris/server): implement production HTTP server"
```

---

### Task 9: Implement the dev-server module

**Files:**
- Create: `packages/@astris/server/src/dev-server.ts`

- [ ] **Step 1: Implement `src/dev-server.ts`**

This module is imported programmatically by `@astris/cli`. It wraps `createServer` with file watching and exposes a `stop()` method.

```typescript
// packages/@astris/server/src/dev-server.ts
import { watch } from 'node:fs'
import type { ServerConfig } from './types'
import { createServer } from './server'

export interface DevServer {
  port: number
  stop(): void
}

export async function startDevServer(config: ServerConfig): Promise<DevServer> {
  let server = createServer(config)
  let restarting = false

  const restart = async () => {
    if (restarting) return
    restarting = true
    server.stop(true)
    server = createServer(config)
    restarting = false
    console.log(`[astris] server restarted on http://${config.hostname}:${server.port}`)
  }

  // Watch routes directory for changes
  const watcher = watch(config.routesDir, { recursive: true }, (_event, filename) => {
    if (filename) restart()
  })

  return {
    get port() {
      return server.port
    },
    stop() {
      watcher.close()
      server.stop(true)
    },
  }
}
```

- [ ] **Step 2: Export from `src/index.ts`**

Add to `packages/@astris/server/src/index.ts`:
```typescript
export type { DevServer } from './dev-server'
export { startDevServer } from './dev-server'
```

- [ ] **Step 3: Add smoke test for dev-server**

Append to `packages/@astris/server/tests/server.test.ts` (these `describe` blocks go after the existing ones — imports are already at the top of the file):

```typescript
import { startDevServer } from '../src/dev-server'

describe('startDevServer', () => {
  it('starts and reports a port, then stops cleanly', async () => {
    const server = await startDevServer({
      port: 0,
      hostname: 'localhost',
      routesDir: testRoutesDir,
      publicDir: join(import.meta.dir, 'test-public'),
    })
    expect(server.port).toBeGreaterThan(0)
    server.stop()
  })
})
```

Also add `import { startDevServer } from '../src/dev-server'` to the **top** of the file alongside the existing imports.

- [ ] **Step 4: Run all server tests**

```bash
cd packages/@astris/server && bun test tests/
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/@astris/server/src/dev-server.ts packages/@astris/server/src/index.ts packages/@astris/server/tests/server.test.ts
git commit -m "feat(@astris/server): implement importable dev-server module"
```

---

## Chunk 3: Create `@astris/web`

New package: React 19 SSR + hydration layer. `renderer.ts` is server-side only. `client.ts` is a browser bundle entry point.

### Task 10: Scaffold `@astris/web`

**Files:**
- Create: `packages/@astris/web/package.json`
- Create: `packages/@astris/web/tsconfig.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@astris/web",
  "version": "0.1.0",
  "description": "React SSR and hydration layer for AstrisJS",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --format=esm --target=bun --minify --sourcemap=linked && bunx dts-bundle-generator -o dist/index.d.ts src/index.ts",
    "test": "bun test tests/",
    "lint": "biome check src tests",
    "format": "biome format src tests --write",
    "clean": "rm -rf dist"
  },
  "keywords": ["bun", "framework", "react", "ssr"],
  "author": {
    "name": "Eric Freitas",
    "email": "contato@freitaseric.com",
    "url": "https://freitaseric.com"
  },
  "license": "MIT",
  "dependencies": {
    "@astris/core": "workspace:*",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@types/bun": "^1.1.0",
    "@types/node": "^25.5.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create directories**

```bash
mkdir -p packages/@astris/web/src packages/@astris/web/tests
```

- [ ] **Step 4: Commit scaffold**

```bash
git add packages/@astris/web/
git commit -m "feat(@astris/web): scaffold package"
```

---

### Task 11: Define web types

**Files:**
- Create: `packages/@astris/web/src/types.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/@astris/web/tests/renderer.test.ts
import { describe, expect, it } from 'bun:test'
import type { BundleOptions, PageProps, RenderContext } from '../src'

describe('RenderContext', () => {
  it('accepts valid context', () => {
    const ctx: RenderContext = {
      route: {
        path: '/',
        params: [],
        isDynamic: false,
        isCatchAll: false,
      },
      params: {},
      url: new URL('http://localhost:3000/'),
      headers: new Headers(),
    }
    expect(ctx.route.path).toBe('/')
  })
})

describe('PageProps', () => {
  it('accepts valid props', () => {
    const props: PageProps = {
      params: { id: '1' },
      searchParams: { q: 'test' },
    }
    expect(props.params.id).toBe('1')
  })
})

describe('BundleOptions', () => {
  it('accepts valid options', () => {
    const opts: BundleOptions = {
      outdir: './dist/client',
      watch: false,
      minify: true,
    }
    expect(opts.outdir).toBe('./dist/client')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/@astris/web && bun test tests/renderer.test.ts
```

Expected: FAIL — cannot find `'../src'`.

- [ ] **Step 3: Create `src/types.ts`**

```typescript
// packages/@astris/web/src/types.ts
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
  outdir: string
  watch?: boolean
  minify?: boolean
}
```

- [ ] **Step 4: Create minimal `src/index.ts`**

```typescript
// packages/@astris/web/src/index.ts
export type { BundleOptions, PageProps, RenderContext } from './types'
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
cd packages/@astris/web && bun test tests/renderer.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/web/src/types.ts packages/@astris/web/src/index.ts packages/@astris/web/tests/renderer.test.ts
git commit -m "feat(@astris/web): add RenderContext, PageProps, and BundleOptions types"
```

---

### Task 12: Implement hydration utilities

**Files:**
- Create: `packages/@astris/web/src/hydration.ts`
- Create: `packages/@astris/web/tests/hydration.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/@astris/web/tests/hydration.test.ts
import { describe, expect, it } from 'bun:test'
import { deserializeState, serializeState } from '../src/hydration'

describe('serializeState', () => {
  it('produces a script tag with JSON state', () => {
    const script = serializeState({ user: { id: 1, name: 'Eric' } })
    expect(script).toContain('<script id="__ASTRIS_STATE__"')
    expect(script).toContain('"user"')
    expect(script).toContain('"Eric"')
  })

  it('escapes </script> in JSON to prevent XSS', () => {
    const script = serializeState({ html: '</script><script>alert(1)</script>' })
    expect(script).not.toContain('</script><script>')
  })
})

describe('deserializeState', () => {
  it('reads state from the DOM script tag', () => {
    const state = { count: 42 }
    // Simulate what the browser would see
    const mockScript = { textContent: JSON.stringify(state) }
    const result = deserializeState(mockScript.textContent)
    expect(result).toEqual(state)
  })

  it('returns empty object when state is missing', () => {
    const result = deserializeState(null)
    expect(result).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/@astris/web && bun test tests/hydration.test.ts
```

Expected: FAIL — cannot find `'../src/hydration'`.

- [ ] **Step 3: Implement `src/hydration.ts`**

```typescript
// packages/@astris/web/src/hydration.ts

const STATE_ID = '__ASTRIS_STATE__'

/**
 * Serialize server state into an HTML script tag.
 * The </script> sequence is escaped to prevent XSS injection.
 */
export function serializeState(state: unknown): string {
  const json = JSON.stringify(state).replace(/<\/script>/gi, '<\\/script>')
  return `<script id="${STATE_ID}" type="application/json">${json}</script>`
}

/**
 * Deserialize state from a JSON string (typically from a script tag's textContent).
 * Returns an empty object if the input is null or unparseable.
 */
export function deserializeState(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export const HYDRATION_STATE_ID = STATE_ID
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd packages/@astris/web && bun test tests/hydration.test.ts
```

Expected: PASS.

- [ ] **Step 5: Export from `src/index.ts`**

Add to `packages/@astris/web/src/index.ts`:
```typescript
export { deserializeState, HYDRATION_STATE_ID, serializeState } from './hydration'
```

- [ ] **Step 6: Commit**

```bash
git add packages/@astris/web/src/hydration.ts packages/@astris/web/src/index.ts packages/@astris/web/tests/hydration.test.ts
git commit -m "feat(@astris/web): implement state serialization for SSR hydration"
```

---

### Task 13: Implement SSR renderer and client bundle

**Files:**
- Create: `packages/@astris/web/src/renderer.ts`
- Create: `packages/@astris/web/src/bundle.ts`
- Create: `packages/@astris/web/src/client.ts`

- [ ] **Step 1: Rewrite `tests/renderer.test.ts`**

Replace the entire file — imports must be at the top. The previous content only tested types; this version adds the renderer test:

```typescript
// packages/@astris/web/tests/renderer.test.ts
import { describe, expect, it } from 'bun:test'
import { createElement } from 'react'
import type { BundleOptions, PageProps, RenderContext } from '../src'
import { render } from '../src/renderer'

describe('RenderContext', () => {
  it('accepts valid context', () => {
    const ctx: RenderContext = {
      route: { path: '/', params: [], isDynamic: false, isCatchAll: false },
      params: {},
      url: new URL('http://localhost:3000/'),
      headers: new Headers(),
    }
    expect(ctx.route.path).toBe('/')
  })
})

describe('PageProps', () => {
  it('accepts valid props', () => {
    const props: PageProps = {
      params: { id: '1' },
      searchParams: { q: 'test' },
    }
    expect(props.params.id).toBe('1')
  })
})

describe('BundleOptions', () => {
  it('accepts valid options', () => {
    const opts: BundleOptions = {
      outdir: './dist/client',
      watch: false,
      minify: true,
    }
    expect(opts.outdir).toBe('./dist/client')
  })
})

describe('render', () => {
  it('returns a ReadableStream of HTML containing the rendered component', async () => {
    const PageComponent = () => createElement('h1', null, 'Hello from SSR')

    const ctx: RenderContext = {
      route: { path: '/', params: [], isDynamic: false, isCatchAll: false },
      params: {},
      url: new URL('http://localhost:3000/'),
      headers: new Headers(),
    }

    const stream = await render(PageComponent, ctx)
    expect(stream).toBeInstanceOf(ReadableStream)

    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const html = Buffer.concat(chunks).toString()
    expect(html).toContain('Hello from SSR')
    expect(html).toContain('__ASTRIS_STATE__')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/@astris/web && bun test tests/renderer.test.ts
```

Expected: FAIL — cannot find `'../src/renderer'`.

- [ ] **Step 3: Implement `src/renderer.ts`**

> **Known tradeoff:** `injectScripts` below buffers the full React stream before returning. This eliminates React 19's incremental streaming capability but simplifies script injection. Future work: use `renderToReadableStream`'s `bootstrapScripts` option and a `TransformStream` to inject state without buffering.

```typescript
// packages/@astris/web/src/renderer.ts
import { createElement } from 'react'
import type { ComponentType } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import type { RenderContext } from './types'
import { serializeState } from './hydration'

const HYDRATION_SCRIPT = '<script type="module" src="/_astris/client.js"></script>'

export async function render(
  PageComponent: ComponentType<{ params: RenderContext['params']; searchParams: Record<string, string> }>,
  ctx: RenderContext,
): Promise<ReadableStream> {
  const searchParams = Object.fromEntries(ctx.url.searchParams.entries())

  const element = createElement(PageComponent, {
    params: ctx.params,
    searchParams,
  })

  const stateScript = serializeState({ params: ctx.params, searchParams })

  const stream = await renderToReadableStream(element)

  // Wrap stream: inject state + hydration script after body
  return injectScripts(stream, stateScript + HYDRATION_SCRIPT)
}

/**
 * Reads the React stream and appends script tags before </body>.
 * Falls back to appending at the end if </body> is not present.
 */
async function injectScripts(stream: ReadableStream, scripts: string): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const reader = stream.getReader()
  const chunks: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(decoder.decode(value, { stream: true }))
  }

  let html = chunks.join('')
  const bodyClose = html.lastIndexOf('</body>')

  if (bodyClose !== -1) {
    html = html.slice(0, bodyClose) + scripts + html.slice(bodyClose)
  } else {
    html += scripts
  }

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(html))
      controller.close()
    },
  })
}
```

- [ ] **Step 4: Implement `src/bundle.ts`**

```typescript
// packages/@astris/web/src/bundle.ts
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

  if (!result.success) {
    throw new AggregateError(result.logs, '@astris/web bundle failed')
  }

  if (options.watch) {
    // Bun.build does not yet support watch mode natively.
    // Re-bundle on file changes using a watcher.
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
```

- [ ] **Step 5: Implement `src/client.ts`**

This file is a browser bundle entry point — it is never imported by server-side code.

> **Important — Bun.build limitation:** Bun's bundler resolves `import()` statically at build time. A fully computed path like `` `/src/routes/${pathname}/page.tsx` `` will not be bundled correctly — Bun cannot statically determine which files to include. The correct approach is to have `bundle()` generate a client entry file that statically imports each page component from the routes registry. This is left as follow-up work. The `client.ts` below uses a pattern that requires Bun's future dynamic import support or a generated entry.

```typescript
// packages/@astris/web/src/client.ts
// Browser-only: bundled by @astris/web bundle() and served as /_astris/client.js
import { createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { deserializeState, HYDRATION_STATE_ID } from './hydration'

async function hydrate() {
  const stateScript = document.getElementById(HYDRATION_STATE_ID)
  const state = deserializeState(stateScript?.textContent ?? null)

  // TODO: Replace this with a generated static import map from routes registry.
  // Bun.build cannot statically analyse computed import paths.
  // For now this serves as the architectural placeholder.
  const pathname = window.location.pathname
  const routePath = pathname === '/' ? '' : pathname
  // biome-ignore lint/security/noGlobalEval: placeholder until generated entry is implemented
  const mod = await eval(`import('/src/routes${routePath}/page.tsx')`) as { default?: unknown }
  const PageComponent = mod.default

  if (typeof PageComponent !== 'function') {
    console.error('[astris] No default export found for', pathname)
    return
  }

  hydrateRoot(
    document.getElementById('__astris_root__') ?? document.body,
    createElement(PageComponent as Parameters<typeof createElement>[0], state as Record<string, unknown>),
  )
}

hydrate()
```

- [ ] **Step 6: Export from `src/index.ts`**

Add to `packages/@astris/web/src/index.ts`:
```typescript
export { bundle } from './bundle'
export { render } from './renderer'
```

> **Do NOT export `client.ts`** from `index.ts` — it is a browser bundle entry point.

- [ ] **Step 7: Run all web tests**

```bash
cd packages/@astris/web && bun test tests/
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add packages/@astris/web/src/ packages/@astris/web/tests/
git commit -m "feat(@astris/web): implement SSR renderer, client hydration, and bundle function"
```

---

## Chunk 4: Complete `@astris/cli`

Wire up the full CLI: `init`, `dev`, `build`, `start`. The `dev` command is the most involved — it orchestrates codegen, server, and client bundler.

### Task 14: Add missing CLI types and dependencies

**Files:**
- Modify: `packages/@astris/cli/src/type.ts`
- Modify: `packages/@astris/cli/package.json`

- [ ] **Step 1: Update `src/type.ts`**

```typescript
// packages/@astris/cli/src/type.ts
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
```

- [ ] **Step 2: Update `package.json`** — add `@astris/server` and `@astris/web` as dependencies

```json
"dependencies": {
  "@astris/core": "workspace:*",
  "@astris/server": "workspace:*",
  "@astris/web": "workspace:*"
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/@astris/cli/src/type.ts packages/@astris/cli/package.json
git commit -m "feat(@astris/cli): add BuildCommandConfig, StartCommandConfig, and server/web dependencies"
```

---

### Task 15: Implement the `dev` command

**Files:**
- Modify: `packages/@astris/cli/src/commands/dev.ts`

- [ ] **Step 1: Replace the entire `dev.ts` file with the following**

```typescript
// packages/@astris/cli/src/commands/dev.ts
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { generateRoutesRegistry, scanRoutes } from '@astris/core'
import { startDevServer } from '@astris/server'
import { bundle, render } from '@astris/web'
import type { DevCommandConfig } from '../type'
import consola from '../utils/consola'

export async function startDev(config: DevCommandConfig) {
  const {
    projectRoot = process.cwd(),
    port = 3000,
    hostname = 'localhost',
    open = true,
  } = config

  const routesDir = join(projectRoot, 'src/routes')
  const publicDir = join(projectRoot, 'public')
  const genDir = join(projectRoot, '.gen')
  const clientOutDir = join(publicDir, '_astris')

  await mkdir(genDir, { recursive: true })
  await mkdir(clientOutDir, { recursive: true })

  consola.info('Scanning routes...')
  await runCodegen(routesDir, genDir)

  consola.info('Bundling client...')
  bundle({ outdir: clientOutDir, watch: true, minify: false }).catch((err) => {
    consola.error('Client bundle error:', err)
  })

  consola.info('Starting dev server...')
  const server = await startDevServer({
    port,
    hostname,
    routesDir,
    publicDir,
    renderer: async (ctx) => {
      if (!ctx.route?.pageFile) {
        return new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('Not Found')); c.close() } })
      }
      const mod = await import(ctx.route.pageFile) as { default: Parameters<typeof render>[0] }
      return render(mod.default, ctx)
    },
  })

  const url = `http://${hostname}:${server.port}`
  consola.success(`Server running at ${url}`)

  if (open) {
    Bun.spawn(['open', url], { stdout: 'ignore', stderr: 'ignore' })
  }

  // Re-run codegen when route files change
  const { watch } = await import('node:fs')
  watch(routesDir, { recursive: true }, async (_event, filename) => {
    if (filename?.endsWith('route.ts') || filename?.endsWith('page.tsx')) {
      consola.info('Routes changed, regenerating...')
      await runCodegen(routesDir, genDir)
    }
  })

  process.on('SIGINT', () => {
    server.stop()
    process.exit(0)
  })
}

async function runCodegen(routesDir: string, genDir: string) {
  const result = await scanRoutes(routesDir)
  const { content } = generateRoutesRegistry(result.routes)
  await writeFile(join(genDir, 'routes.ts'), content)
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/@astris/cli/src/commands/dev.ts
git commit -m "feat(@astris/cli): implement dev command orchestrator"
```

---

### Task 16: Implement `build` and `start` commands, wire up CLI entry point

**Files:**
- Create: `packages/@astris/cli/src/commands/build.ts`
- Create: `packages/@astris/cli/src/commands/start.ts`
- Modify: `packages/@astris/cli/src/index.ts`

- [ ] **Step 1: Implement `build.ts`**

```typescript
// packages/@astris/cli/src/commands/build.ts
import { join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { generateRoutesRegistry, scanRoutes } from '@astris/core'
import { bundle } from '@astris/web'
import type { BuildCommandConfig } from '../type'
import consola from '../utils/consola'

export async function buildApp(config: BuildCommandConfig) {
  const { projectRoot = process.cwd() } = config

  const routesDir = join(projectRoot, 'src/routes')
  const publicDir = join(projectRoot, 'public')
  const genDir = join(projectRoot, '.gen')
  const clientOutDir = join(publicDir, '_astris')

  await mkdir(genDir, { recursive: true })
  await mkdir(clientOutDir, { recursive: true })

  consola.info('Scanning routes...')
  const result = await scanRoutes(routesDir)
  const { content } = generateRoutesRegistry(result.routes)
  await writeFile(join(genDir, 'routes.ts'), content)
  consola.success(`Found ${result.routes.length} routes`)

  consola.info('Bundling client...')
  await bundle({ outdir: clientOutDir, minify: true })
  consola.success('Client bundle complete')

  consola.success('Build complete!')
}
```

- [ ] **Step 2: Implement `start.ts`**

```typescript
// packages/@astris/cli/src/commands/start.ts
import { join } from 'node:path'
import { createServer } from '@astris/server'
import type { StartCommandConfig } from '../type'
import consola from '../utils/consola'

export async function startApp(config: StartCommandConfig) {
  const {
    projectRoot = process.cwd(),
    port = 3000,
    hostname = 'localhost',
  } = config

  const server = createServer({
    port,
    hostname,
    routesDir: join(projectRoot, 'src/routes'),
    publicDir: join(projectRoot, 'public'),
  })

  consola.success(`Server running at http://${hostname}:${server.port}`)
}
```

- [ ] **Step 3: Wire up `src/index.ts` as a proper CLI**

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add packages/@astris/cli/src/
git commit -m "feat(@astris/cli): implement build, start commands and wire up CLI entry point"
```

---

## Chunk 5: Delete `@astris/types` and run full suite

### Task 17: Delete `@astris/types` and run final verification

**Files:**
- Delete: `packages/@astris/types/` (entire directory)

- [ ] **Step 1: Verify no remaining imports of `@astris/types`**

```bash
grep -r "@astris/types" packages/ --include="*.ts" --include="*.tsx" --include="*.json"
```

Expected: no output. If any file still imports from `@astris/types`, update it before deleting.

- [ ] **Step 2: Delete the package**

```bash
git rm -r packages/@astris/types/
```

- [ ] **Step 3: Install dependencies to sync lockfile**

```bash
bun install
```

- [ ] **Step 4: Run full test suite**

```bash
bun run test
```

Expected: all tests pass across `@astris/core`, `@astris/server`, `@astris/web`.

- [ ] **Step 5: Run lint**

```bash
bun run lint
```

Expected: no errors.

- [ ] **Step 6: Final commit**

```bash
git rm -r packages/@astris/types/
git add packages/@astris/core/ packages/@astris/server/ packages/@astris/web/ packages/@astris/cli/ bun.lock
git commit -m "feat: complete package architecture redesign — delete @astris/types, add @astris/server and @astris/web"
```

---

## Summary

| Package | Status after plan |
|---------|------------------|
| `@astris/types` | Deleted |
| `@astris/core` | Kernel only — no Bun, no React, no HTTP |
| `@astris/server` | New — Bun HTTP adapter with dev-server module |
| `@astris/web` | New — React 19 SSR renderer + bundle function |
| `@astris/cli` | Complete — init, dev, build, start all wired |
