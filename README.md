<div align="center">
  <img src="./assets/banner.png" alt="AstrisJS Logo" />

# AstrisJS

  **Native performance. TypeScript ergonomics. The next-gen Discord framework.**

  [![NPM Version](https://img.shields.io/npm/v/astris.js?style=flat-square&color=blue)](https://www.npmjs.com/package/astris.js)
  [![License](https://img.shields.io/npm/l/astris.js?style=flat-square)](LICENSE)
  [![CI Status](https://img.shields.io/github/actions/workflow/status/astrisjs/astris.js/CI.yml?style=flat-square&label=ci)](https://github.com/astrisjs/astris.js/actions)

</div>

---

## 🌌 Overview

**AstrisJS** is a high-performance Discord framework powered by a **Rust** core, exposed to Node.js and Bun via **N-API**.

Unlike traditional frameworks that run entirely in JavaScript, AstrisJS offloads heavy operations (Gateway management, Sharding, Caching, Voice encoding) to native code. This results in incredibly low memory usage and instant startup times, while keeping your application logic in the TypeScript/JavaScript you already know and love.

### ✨ Key Features

- **🚀 Rust Powered:** The core engine is written in Rust, offering near-zero overhead and superior concurrency.
- **⚡ Blazing Fast:** Utilizing system threads for WebSocket management instead of the Node.js Event Loop.
- **🛡️ TypeScript First:** Full type safety with auto-generated definitions. No manual typings required.
- **📦 Zero-Cost Abstraction:** Use it like a normal JS library (`npm install`), run it with native performance.
- **🏗️ Modern Architecture:** Designed for the **Bun** runtime but fully compatible with Node.js.

---

## 📦 Installation

AstrisJS is distributed as a native Node.js addon. It works out of the box without needing to install Rust on your machine.

```bash
# Using Bun (Recommended)
bun add astris.js

# Using npm
npm install astris.js

# Using yarn
yarn add astris.js
```

## 🚀 Quick Start

Initialize the native engine and start listening to events with just a few lines of code.

```ts
import { BotEngine } from 'astris.js';

// 1. Initialize the Rust Core
const bot = new BotEngine("MyBotToken");

console.log("Connecting to Gateway...");

// 2. Hook into the native event stream
// The callback runs in the JS thread, but is triggered by the Rust thread
bot.connect((err, event) => {
  if (err) {
    console.error("Gateway Error:", err);
    return;
  }

  console.log(`Received Event: ${event.type}`);

  if (event.content === '!ping') {
    console.log('Pong!');
  }
});
```

## 🗺️ Roadmap

We are currently in the Alpha stage. The core binding infrastructure is ready, and we are porting features.

- [ ] Core: N-API Bindings & CI/CD Pipeline
- [ ] Runtime: Thread-safe communication (Rust ↔ JS)
- [ ] Gateway: Full WebSocket connection implementation
- [ ] Cache: Native in-memory caching (Rust Structs)
- [ ] Handlers: Command & Event interaction wrappers
- [ ] Voice: Native Opus encoding

## 🤝 Contributing

Contributions are welcome! Since this is a hybrid project, you will need both Node.js/Bun and Rust installed.

### Prerequisites

- Rust & Cargo (Latest Stable)
- Bun (v1.0+)

### Setup

1. Fork the project.
2. Clone your fork.
3. Install dependencies and build the bindings:

```bash
# Install JS dependencies
bun install

# Compile the Rust Core (takes a moment)
bun run build
```

4. Create your Feature Branch (git checkout -b feature/AmazingFeature).
5. Commit your changes.
6. Open a Pull Request.

Please make sure to run `bun run test` to verify the bindings before pushing.

## 📄 License

Distributed under the Apache-2.0 `License`. See LICENSE for more information.