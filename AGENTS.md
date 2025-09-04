# Repository Guidelines

## Project Structure & Module Organization
- src/: application and library code (group by domain/module).
- tests/: unit and integration tests mirroring src/ layout.
- assets/: static files (images, fonts, seeds, fixtures).
- scripts/: local dev helpers (e.g., dev, test, build).
- docs/: design notes and ADRs; keep short and current.

Example: src/auth/, src/api/, tests/auth/, tests/api/

## Build, Test, and Development Commands
- Dev: run a fast local loop (examples: ./scripts/dev.ps1, npm run dev).
- Test: run all tests with coverage (examples: ./scripts/test.ps1, pytest -q, npm test).
- Build: produce an optimized build or package (examples: ./scripts/build.ps1, make build).

Prefer scripts in scripts/ to hide tool specifics. Keep scripts idempotent and cross-platform when possible.

## Coding Style & Naming Conventions
- Indentation: 4 spaces; keep lines ≤ 100 chars.
- Naming: PascalCase classes/types; camelCase functions/variables; kebab-case file names; snake_case for data fields where required by a format.
- Imports: absolute from module roots; avoid deep relative chains.
- Formatting: use an auto-formatter for your language (e.g., Prettier, Black). Do not hand-format.

## Testing Guidelines
- Framework: use the project’s default test runner for the language (e.g., pytest, jest, dotnet test).
- Layout: tests mirror src/ paths; name tests descriptively (e.g., test_auth_login_success).
- Coverage: aim ≥ 80% overall; include edge cases and error paths.
- Run locally before pushing; keep tests deterministic and fast.

## Commit & Pull Request Guidelines
- Commits: concise, imperative, and scoped. Prefer Conventional Commits (e.g., feat: add login throttling; fix: handle null token).
- PRs: small, focused; include summary, rationale, screenshots/logs for UI/behavioral changes, and linked issues.
- Checks: ensure tests, lint, and build pass. Note any migrations or breaking changes.

## Security & Configuration Tips
- Never commit secrets; use environment variables and example files (e.g., .env.example).
- Validate and sanitize external input; log without leaking sensitive data.
- Principle of least privilege for keys, tokens, and service accounts.

## Architecture Overview (Brief)
- Organize by domain within src/ (e.g., auth, billing, shared).
- Keep modules cohesive with clear boundaries; share code via shared/ utilities.
- Prefer small, composable functions and explicit interfaces.

