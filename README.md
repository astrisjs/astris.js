# ✨ Astris

Um framework fullstack **moderno**, **rápido** e **type-safe**, construído 100% em Bun.

> **Nota:** Estamos em desenvolvimento ativo. Veja [PLANO_COMPLETO.md](./PLANO_COMPLETO.md) para o roadmap detalhado.


## 🎯 Visão

Astris é um framework para criar **aplicações web modernas** com:

- **SSR + SPA automático** — Renderiza páginas no servidor, aplicação moderna no cliente
- **Roteamento baseado em arquivos** — Estrutura intuitiva, como Next.js ou Remix
- **API type-safe** — Cliente HTTP com tipos automáticos
- **CLI completa** — `astris create`, `dev`, `build` — pronto pra usar
- **Performance extrema** — Construído em Bun, não Node.js
- **Binário executável nativo** — Deploy como um único arquivo


## 🚀 Status Atual

**Fase 1-3 de 10:** Configuração de monorepo, core framework, e testes iniciais.


## 📚 Documentação

- Documentação pública em `/docs`
- Getting started guide
- Exemplos funcionais


## 🏗️ Estrutura do Monorepo

```
astris/
├── packages/
│   ├── @astrisjs/core/          ← Framework principal (NPM)
│   ├── create-astris-app/       ← CLI (NPM)
│   └── example-app/             ← Exemplo funcional
├── docs/                        ← Documentação pública
```


## 🛠️ Desenvolvimento

### Setup

```bash
cd /home/claude/astris
bun install           # Instala workspaces
bun run build        # Build todos os packages
bun run test         # Roda testes
```

### Estrutura de Desenvolvimento

```bash
# Raiz (Turborepo)
bun run build        # Build tudo
bun run test         # Test tudo
bun run lint         # Lint tudo
bun run dev          # Dev mode em paralelo

# Ou um package específico
cd packages/@astrisjs/core
bun run build
bun run test
```


## 📦 Packages

### `@astrisjs/core` (0.1.0)
O framework principal:
- Scanner de rotas (descoberta automática)
- Router HTTP type-safe
- Gerador de código
- Servidor SSR + SPA
- CLI (create, dev, build)

### `create-astris-app` (0.1.0)
Script de criação:
- `bun create create-astris-app meu-projeto`
- Copia template inicial
- Instala dependências

### `example-app`
Aplicação de exemplo com rotas completas (não publicada no NPM).


## 🎯 Roadmap

### v0.1 (Em Progresso)
- [x] Estrutura de monorepo
- [x] Core framework base
- [ ] CLI completa (create, dev, build)
- [ ] Template inicial
- [ ] Exemplo funcional
- [ ] GitHub Actions
- [ ] Documentação

### v0.2 (Próximo)
- [ ] Publicar no NPM
- [ ] Website oficial
- [ ] Mais exemplos
- [ ] Plugin system

### v1.0 (Futuro)
- [ ] `@astrisjs/orm` — Helpers para Drizzle, Prisma, Mongoose
- [ ] `@astrisjs/auth` — Autenticação integrada
- [ ] `@astrisjs/deploy` — Presets (Railway, Vercel, etc)
- [ ] Dashboard web
- [ ] Community plugins


## 💡 Conceito

Astris é:

- ✅ **Fullstack** — SSR, SPA, API tudo junto
- ✅ **Moderno** — TypeScript strict, React 19
- ✅ **Rápido** — Bun runtime, sem overhead
- ✅ **Type-safe** — Tipos extraídos automaticamente
- ✅ **Deployable** — Binário executável nativo
- ❌ **Não é Node.js** — Bun only (por enquanto)
- ❌ **Não é Next.js** — Arquitetura diferente, simplificada


## 🤝 Como Contribuir

Este projeto está em **desenvolvimento ativo inicial**.

Se quiser acompanhar ou contribuir:

1. Abra uma issue com sugestões
2. Fork do repositório
3. Implemente seguindo [PLANO_COMPLETO.md](./PLANO_COMPLETO.md)
4. Faça PR

## 📄 Licença

MIT — Use livremente, comercial ou pessoal.

## 👤 Autor

**Eric** — Desenvolvedor de frameworks em Bun

## 🔗 Links

- [Bun](https://bun.sh) — Runtime JavaScript/TypeScript ultrarrápido
- [React](https://react.dev) — Biblioteca de UI
- [Turborepo](https://turbo.build) — Orquestração de monorepo
- [TypeScript](https://www.typescriptlang.org) — Type safety
