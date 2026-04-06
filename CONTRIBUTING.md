# Contributing to Astris

Thank you for your interest in contributing to Astris! We welcome contributions of all kinds.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch (`git checkout -b feat/amazing-feature`)
4. Follow the [development setup guide](./DEVELOPMENT.md)

## Development Workflow

### Setup
```bash
bun install
bunx husky install
chmod +x .husky/pre-commit
```

### Making Changes

1. Make your changes in your feature branch
2. Run the local CI pipeline to ensure everything passes:
```bash
   make ci
```
   This runs linting, builds, and tests.

3. Commit your changes (pre-commit hooks will run automatically):
```bash
   git commit -m "feat: add amazing feature"
```

4. Push to your fork:
```bash
   git push origin feat/amazing-feature
```

5. Open a Pull Request to `main`

## Code Style

- Use **TypeScript** with strict mode enabled
- Follow [Biome](https://biomejs.dev) formatting rules
- Write descriptive commit messages
- Keep commits atomic and focused

## Testing

All contributions must include tests:
```bash
# Run tests
bun run test

# Run specific test file
bun run test tests/router.test.ts
```

## Pull Request Process

1. Ensure all CI checks pass
2. Add tests for new functionality
3. Update documentation if needed
4. Keep PRs focused on a single feature/fix
5. Link any related issues

## Reporting Issues

- Check if the issue already exists
- Provide a clear description
- Include steps to reproduce (for bugs)
- Share your environment (Bun version, OS, etc.)

## Questions?

- Create a discussion in the repository
- Join our Discord community (link coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thanks for contributing to Astris! 🚀