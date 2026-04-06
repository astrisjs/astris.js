# ✨ Astris

**Build at the speed of light.**

A modern, type-safe, and blazingly fast fullstack framework built 100% on Bun.

[![Bun](https://img.shields.io/badge/Bun-v1.3+-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

## About

Astris is a fullstack framework built from the ground up on Bun. It combines **automatic file-based routing**, **type-safe APIs**, **SSR + SPA hydration**, and the ability to **deploy as a native binary** — all with zero configuration.

**Features:**
- 🚀 Blazingly fast (built on Bun, not Node.js)
- 📁 File-based routing (intuitive and automatic)
- 🔐 Fully type-safe (extracted from route definitions)
- 🎯 Zero configuration (works out of the box)
- 💾 SSR + SPA (server-side rendering with client hydration)
- 🐍 Deploy as native binary (single executable)

## Installation

**Node.js 18.0.0 or newer is required.**
```bash
bunx @astris/cli init my-app
cd my-app
bun install
bun run dev
```

## Example Usage

### Create a page
```typescript
// src/routes/page.tsx
export default function Home() {
  return <h1>Welcome to Astris</h1>
}
```

### Create an API route
```typescript
// src/routes/api/hello/route.ts
export interface HelloResponse {
  message: string
}

export async function GET(): Promise<Response> {
  return Response.json({ message: 'Hello from Astris!' })
}
```

### Dynamic routes
```typescript
// src/routes/users/[id]/page.tsx
export default function User({ params }: { params: { id: string } }) {
  return <h1>User {params.id}</h1>
}
```

## Documentation

- [Getting Started](https://astris.dev/docs) (coming soon)
- [API Reference](https://astris.dev/docs/api) (coming soon)
- [Guides](https://astris.dev/docs/guides) (coming soon)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested.

See the [contribution guide](./CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle push in the right direction, please don't hesitate to join our official [Discord Server](https://discord.gg/astris).

## License

Licensed under the [MIT License](./LICENSE)