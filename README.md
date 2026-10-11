# Mango Range Challenge

A price range selector built with Next.js App Router, TypeScript, and CSS Modules. It supports a numeric interval with editable prices and a predefined set of fixed prices.

## Getting started

Requires Node.js 22.20.0 (see `.nvmrc`) and npm 10.

```sh
npm ci
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). Both development and production use port 8080.

| Page | Purpose |
| --- | --- |
| `/` | Exercise index. |
| `/exercise1` | Numeric range with two editable price inputs. |
| `/exercise2` | Predefined prices with read-only labels. |

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create the production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | Generate route types and check TypeScript. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run tests once. |
| `npm run test:watch` | Rerun tests when files change. |

For production, run `npm run build` followed by `npm start`.

## Structure

```text
src/
  app/                       # Pages, layouts, and mock API routes
  components/
    Range/                   # Selection, price editing, and keyboard/pointer controls
    RangeExercise/           # Data loading, error message, and retry
  services/range.service.ts  # HTTP requests and response validation
  types/range-config.ts      # Shared configuration types
  test/setup.ts              # DOM matchers and test cleanup
```

Pages render `RangeExercise`, which loads the configuration and passes it to `Range`. The selector owns its selection state and does not fetch data. Tests sit alongside the code they cover.

## Range behavior

```tsx
<Range mode="continuous" min={1} max={100} />
<Range mode="discrete" values={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]} />
```

- Both handles support mouse and touch dragging. Clicking the track moves the nearest handle. Values cannot cross or leave the configured bounds.
- Tab focuses each handle; arrow keys change its value. Home and End select the lowest and highest allowed values. Handles expose their current values and limits through ARIA, with visible keyboard focus.
- Numeric mode keeps the configured limits visible and provides two inputs for the selected prices. Enter or blur applies an edit; Escape cancels it. Inputs accept decimal points or commas, round to cents, and clamp to the allowed interval. Invalid or empty input restores the previous price.
- Numeric movement uses one-unit steps and preserves entered cents during dragging. Fixed mode moves through equally spaced options and keeps prices read-only.

Each instance starts at the extremes and expects its configuration to remain fixed while mounted.

## Mock API

The endpoints run within Next.js and require no external services or credentials.

| Endpoint | Response |
| --- | --- |
| `GET /api/range` | `{ "min": 1, "max": 100 }` |
| `GET /api/range-options` | `{ "rangeValues": [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] }` |

The service validates numeric bounds and requires at least two finite, strictly increasing fixed prices. Pages show loading and error states with a retry button. Requests are cancelled when the loading component unmounts.

## Tests

Vitest and React Testing Library cover each component, the service, API routes, and all pages. They check keyboard and pointer interaction, editable prices, bounds, response validation, and request cancellation. Exercise page tests use the real service and selector, mocking only `fetch` to check loading, interaction, errors, and retry.

## Dependency notes

Some transitive ESLint plugins report peer dependency warnings with ESLint 10; linting passes with the pinned versions. The last audit reported the [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) in development dependencies. The proposed automatic fix downgrades `eslint-config-next` to version 14 and has not been applied to this Next.js 16 project. The production audit (`npm audit --omit=dev`) reported no vulnerabilities.
