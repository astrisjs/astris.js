# Package Architecture Design — AstrisJS

**Date:** 2026-04-07  
**Status:** Approved  
**Author:** Eric Freitas

---

## Context

AstrisJS is a fullstack SSR+SPA framework built 100% on Bun. The current monorepo has `@astris/core`, `@astris/types`, and `@astris/cli`. The goal of this redesign is to split responsibilities clearly so the framework can support multiple rendering targets in the future (React Native, proprietary JSX renderer) without touching the core kernel.

---

## Goals

- Make `@astris/core` a platform-agnostic kernel with zero HTTP, DOM, or React dependencies
- Create `@astris/server` as the Bun HTTP adapter (replaceable by a future Zig/Rust server)
- Create `@astris/web` as the React SSR + hydration layer (replaceable by a future renderer)
- Eliminate `@astris/types` by co-locating types with the package that defines them
- Deliver a full dev experience via `@astris/cli` (file watching, HMR, browser open, error overlay)

---

## Package Graph

```
@astris/core        (no external deps beyond Node built-ins)
@astris/server  →   depends on @astris/core
@astris/web     →   depends on @astris/core
@astris/cli     →   depends on @astris/core + @astris/server + @astris/web
@astris/types   →   DELETED
```

No circular dependencies. `@astris/core` knows nothing about HTTP, React, or Bun-specific APIs.

---

## Package Responsibilities

### `@astris/core`

Platform-agnostic kernel. Compatible with Node.js and Bun. Not intended for browser or React Native environments — those targets use `@astris/core` only for the router and types, not for the scanner.

| Module | Responsibility |
|--------|---------------|
| `scanner.ts` | Walk `src/routes/` using Node `fs` built-ins and detect `page.tsx` / `route.ts` files |
| `router.ts` | Match URL pathnames to `RouteEntry`, extract dynamic params and catch-all segments |
| `ast-parser.ts` | Extract exported HTTP handlers and TypeScript types from route files (regex-based). Intentionally avoids a full TypeScript compiler/AST dependency to keep the package lightweight. Known limitation: does not handle re-exports or `export * from` patterns. |
| `codegen.ts` | Generate typed `routes registry` and `api client` from scanned routes |

**Owns types:** `RouteEntry`, `MatchedRoute`, `ParsedRoute`, `ScanResult`, `CodegenResult`

**Public API surface:** All exported types from `@astris/core` are stable contracts that `@astris/server`, `@astris/web`, and any future adapters must depend on. Breaking changes to these types are breaking changes to the entire adapter ecosystem.

**Must NOT import:** `Bun`, `react`, `react-dom`, any HTTP primitive.

---

### `@astris/server`

Bun HTTP adapter. Handles incoming requests and delegates to core and web.

| Module | Responsibility |
|--------|---------------|
| `server.ts` | `Bun.serve` entry point; dispatches requests to API handlers or the web renderer |
| `static.ts` | Serve files from the project's `public/` directory |
| `dev-server.ts` | Development mode server exported as a module. `@astris/cli` imports and calls it programmatically (not spawns as subprocess) to coordinate HMR between the server watcher and the client bundle watcher. |

**Owns types:** `ServerConfig`, `RequestContext`

**Flow:**
1. Receive `Request`
2. Match route via `@astris/core` Router
3. If API route → import `route.ts`, execute `GET`/`POST`/etc handler, return `Response`
4. If page route → delegate to `@astris/web` renderer, return HTML stream
5. If no match → 404

---

### `@astris/web`

React 19 rendering layer. Knows nothing about Bun or HTTP internals.

| Module | Responsibility |
|--------|---------------|
| `renderer.ts` | Server-side render a `page.tsx` component via `renderToReadableStream` |
| `client.ts` | Browser entry point; calls `React.hydrateRoot()` on the server-rendered HTML |
| `hydration.ts` | Serialize server state into the HTML and deserialize it on the client |

**Owns types:** `RenderContext`, `PageProps`

```ts
// RenderContext — constructed by @astris/server, consumed by @astris/web
interface RenderContext {
  route: RouteEntry        // from @astris/core
  params: Record<string, string | string[]>
  url: URL
  headers: Headers
}

// PageProps — passed to every page.tsx component
interface PageProps {
  params: Record<string, string | string[]>
  searchParams: Record<string, string>
}
```

**Contract with `@astris/server`:** `renderer.ts` exposes a single function `render(ctx: RenderContext): Promise<ReadableStream>`. `@astris/server` constructs a `RenderContext` and calls it. `@astris/web` has no knowledge of `Bun.serve` or HTTP routing internals.

**Client bundling:** `@astris/web` exposes a `bundle(options: BundleOptions): Promise<void>` function that calls `Bun.build` using `client.ts` as the entry point. `@astris/cli` calls this function for both `dev` (watch mode) and `build` (production). This keeps bundling logic inside the package that owns the client entry point, so future renderers (`@astris/jsx`) can plug into the same CLI without requiring changes to `@astris/cli`.

```ts
// BundleOptions — a simplified subset, does not expose full Bun.BuildConfig
interface BundleOptions {
  outdir: string     // output directory for the client bundle
  watch?: boolean    // enable watch mode (dev only)
  minify?: boolean   // enable minification (production only)
}
```

---

### `@astris/cli`

Developer toolchain and project scaffolding.

| Command | Responsibility |
|---------|---------------|
| `init` | Clone official template, write `package.json` referencing `@astris/web` and `@astris/server`, optionally install deps |
| `dev` | Orchestrate: run codegen on startup + watch route files and re-run codegen on changes + call `@astris/server` dev-server module (watch mode) + call `@astris/web` bundle (watch mode) + open browser + inject error overlay script via dev-server |
| `build` | Call `@astris/core` codegen to generate routes registry + call `@astris/web` bundle for production |
| `start` | Start `@astris/server` in production mode |

---

## Request Data Flow

```
Browser request
      │
      ▼
@astris/server — Bun.serve
      │
      ├── Static asset (/public/*) → serve file directly
      │
      ├── API route (/api/* or route.ts present, no page.tsx)
      │     └── import route.ts → call handler → return Response
      │
      └── Page route (page.tsx present)
            │
            ▼
      @astris/web — renderer.ts
            ├── import page.tsx
            ├── renderToReadableStream(PageComponent)
            ├── inject serialized state + hydration script
            └── return ReadableStream (HTML)
                  │
                  ▼
            Browser — @astris/web client.ts
                  └── React.hydrateRoot() → interactive app
```

---

## Migration Strategy

**Approach: Big Bang** — all changes made at once in a single implementation cycle.

1. Delete `@astris/types` package
2. Move types to their owner packages (`@astris/core`, `@astris/server`, `@astris/web`)
3. Update all imports across the monorepo
4. Create `@astris/server` with `server.ts`, `static.ts`, `dev-server.ts`
5. Create `@astris/web` with `renderer.ts`, `client.ts`, `hydration.ts`
6. Complete `@astris/cli` `dev` command as full orchestrator
7. Remove `Bun.serve` from `@astris/core/src/server.ts`
8. Update `turbo.json` and root `package.json` workspaces

---

## Future Extensibility

This architecture intentionally enables:

- **`@astris/native`** — React Native renderer using `@astris/core` router and scanner, no `@astris/server` or `@astris/web` involved
- **`@astris/jsx`** — Proprietary JSX renderer replacing `@astris/web`, same contract with `@astris/server`
- **`@astris/zig-server`** / **`@astris/rust-server`** — Alternative HTTP adapters replacing `@astris/server`, same contract with `@astris/web` and `@astris/core`

The invariant: `@astris/core` never changes when the transport or renderer changes.
