# Mango Range Challenge

A technical challenge to build a price range selector with two modes: a numeric interval and predefined values.

## Status

Phase 2: the project foundation now includes mock HTTP endpoints and a validated data service. The Range component and exercise pages will be added in subsequent phases.

## Requirements

- Node.js 22.20.0 (specified in `.nvmrc`).
- npm 10.

## Installation and development

```sh
npm ci
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

To use a different port for a local review, run `npm run dev -- --port 8000` and open [http://localhost:8000](http://localhost:8000). The default remains 8080 as required by the exercise.

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
    api/
      range/          # Numeric range endpoint and test
      range-options/  # Fixed prices endpoint and test
    layout.tsx       # HTML document, language, and metadata
    page.tsx         # Home page
    page.module.css  # Local home page styles
    page.test.tsx    # Home page test
    globals.css      # Shared base styles
    icon.svg         # Browser tab icon
  services/
    range.service.ts        # HTTP requests and response validation
    range.service.test.ts
  types/
    range-config.ts         # Numeric and fixed range configuration types
  test/
    setup.ts        # DOM matchers and cleanup between tests
```

The home page is a synchronous Server Component. It requires no state or interaction logic. Page-specific styles are encapsulated with CSS Modules; global styles cover the visual baseline and keyboard focus. System fonts avoid external downloads during builds.

## Data flow

Both mock endpoints run within Next.js, with no external service or credentials required:

| Endpoint | Response |
| --- | --- |
| `GET /api/range` | `{ "min": 1, "max": 100 }` |
| `GET /api/range-options` | `{ "rangeValues": [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] }` |

`getRangeConfig(mode, signal?)` requests the matching endpoint and validates the JSON before returning a `RangeConfig`. Numeric limits must be finite numbers with `min < max`. Fixed prices must contain at least two finite numbers in strictly increasing order. Invalid responses are rejected rather than sorted or corrected silently.

The service accepts an optional `AbortSignal` for cancellation and uses relative URLs, so it works on either local port. Loading, error, and retry handling will be added with the exercise pages. The home page does not fetch range data yet.

## Tests

Vitest and React Testing Library cover the home page, endpoint contracts, service validation, and HTTP errors. Tests live alongside the code they cover. Page integration tests will be added with the same tools when the exercise pages are implemented.

## Development phases

1. Project foundation.
2. Mock HTTP endpoints and validated data service.
3. Range core and keyboard navigation.
4. Dragging and price editing.
5. `/exercise1` and `/exercise2` pages, data loading, and integration tests.
6. Final review and delivery documentation.

The initial phase will be the first commit on `main`. Each subsequent phase will have its own branch and pull request, squash-merged after review.

All project text, documentation, code comments, identifiers, and commit messages must be written in English.

## Dependency notes

The Next.js configuration supports ESLint 10. Some transitive plugins still declare compatibility only up to ESLint 9, so npm reports peer dependency warnings. Installation and linting are checked with the pinned versions.

The initial npm audit reports [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) in `braces`, a transitive linting dependency. The packages in its dependency chain are also reported. The proposed automatic fix downgrades `eslint-config-next` to version 14, so it is not applied to this Next.js 16 project.

The initial `npm audit --omit=dev` check reports no vulnerabilities in production dependencies.
