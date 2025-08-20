# Repository Guidelines

## Project Structure & Module Organization
- Source: `site.jsx` in the repository root is the primary entry point.
- Add new modules as colocated files (e.g., `components/Widget.jsx`) and import from `site.jsx`.
- Keep assets in `assets/` (e.g., images, fonts) and reference them via relative paths.

## Build, Test, and Development Commands
This repository does not ship a build setup by default. Use a lightweight bundler locally.
- Build (example with esbuild):
  - `npx esbuild site.jsx --bundle --outfile=dist/bundle.js --format=iife --sourcemap`
- Serve locally (any static server):
  - `npx http-server dist` or `npx serve dist`
- Watch mode (example):
  - `npx esbuild site.jsx --bundle --outfile=dist/bundle.js --format=iife --sourcemap --watch`

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF-8; LF line endings.
- Filenames: `PascalCase.jsx` for components, `camelCase.js` for utilities.
- Prefer functional, stateless components where possible.
- Use clear, descriptive names; avoid abbreviations.
- Recommended: Prettier and ESLint (Airbnb or Standard). Example scripts once configured:
  - `npm run lint` and `npm run format`.

## Testing Guidelines
- Framework (recommended): Vitest or Jest.
- Test files: colocate as `*.test.jsx` near the code (e.g., `Button.test.jsx`).
- Coverage target: aim for 80%+ on critical paths.
- Run (once configured): `npm test` or `npx vitest`.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits (e.g., `feat: add hero section`, `fix: correct image path`).
- Keep commits focused and atomic; write imperative, present-tense messages.
- Pull Requests: include a clear summary, linked issues (e.g., `Closes #12`), and screenshots or GIFs for UI changes.
- Request review early for scope alignment; update PR description as changes evolve.

## Security & Configuration Tips
- Do not commit secrets or API keys; use environment files excluded via `.gitignore`.
- Validate and sanitize any external input if adding network features.
- Keep third-party dependencies minimal and pinned when introduced.

