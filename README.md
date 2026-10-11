# Mango Range Challenge

A technical challenge to build a price range selector with two modes: a numeric interval and predefined values.

## Status

Phase 1: a manually configured project foundation using Next.js, App Router, strict TypeScript, and CSS Modules. Only the home page is available so far; services, the Range component, and exercise pages will be added in subsequent phases.

## Requirements

- Node.js 22.20.0 (specified in `.nvmrc`).
- npm 10.

## Installation and development

```sh
npm ci
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

If PowerShell's execution policy prevents running `npm`, use `npm.cmd` with the same arguments without changing the system policy.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the development server on port 8080. |
| `npm run build` | Creates the production build. |
| `npm start` | Serves the production build on port 8080. |
| `npm run typecheck` | Generates Next.js route types and checks TypeScript. |
| `npm run lint` | Runs ESLint with no warnings allowed. |
| `npm test` | Runs tests once. |
| `npm run test:watch` | Runs tests when files change. |

To test production, stop the development server first, run `npm run build`, then run `npm start`.

## Structure

```text
src/
  app/
    layout.tsx       # HTML document, language, and metadata
    page.tsx         # Home page
    page.module.css  # Local home page styles
    page.test.tsx    # Home page test
    globals.css      # Shared base styles
    icon.svg         # Browser tab icon
  test/
    setup.ts        # DOM matchers and cleanup between tests
```

The home page is a synchronous Server Component. It requires no state or interaction logic. Page-specific styles are encapsulated with CSS Modules; global styles cover the visual baseline and keyboard focus. System fonts avoid external downloads during builds.

## Tests

Vitest and React Testing Library run an initial test that checks the accessible home page heading within the main content. Tests live alongside the code they cover. Page integration tests will be added with the same tools when the exercise pages are implemented.

## Development phases

1. Project foundation.
2. Mock HTTP endpoints, service, and data loading.
3. Range core and keyboard navigation.
4. Dragging and price editing.
5. `/exercise1` and `/exercise2` pages with integration tests.
6. Final review and delivery documentation.

The initial phase will be the first commit on `main`. Each subsequent phase will have its own branch and pull request, squash-merged after review.

All project text, documentation, code comments, identifiers, and commit messages must be written in English.

## Dependency notes

The Next.js configuration supports ESLint 10. Some transitive plugins still declare compatibility only up to ESLint 9, so npm reports peer dependency warnings. Installation and linting are checked with the pinned versions.

The initial npm audit reports [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) in `braces`, a transitive linting dependency. The packages in its dependency chain are also reported. The proposed automatic fix downgrades `eslint-config-next` to version 14, so it is not applied to this Next.js 16 project.

The initial `npm audit --omit=dev` check reports no vulnerabilities in production dependencies.
