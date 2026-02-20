# Pelican Slideshow

A photo slideshow app that fetches random pelican images from the Unsplash API. Built with a React + TypeScript frontend and an Express + TypeScript backend.

## Setup

Install tooling (once per machine):

```bash
brew install just lefthook
```

After cloning:

```bash
just setup
```

This installs all dependencies and registers the git hooks (lint + type-check run on commit).

### Environment variables

Both services use env files. Templates documenting all variables are committed as `.env.secrets` in each directory.

**Backend** — create `backend/.env`:

```bash
echo "UNSPLASH_ACCESS_KEY=your_key_here" > backend/.env
```

Get a key by creating a free account at [unsplash.com/developers](https://unsplash.com/developers) and registering an application.

**Frontend** — optional, defaults to `http://localhost:3200`:

```bash
echo "VITE_API_URL=http://localhost:3200" > frontend/.env.local
```

The frontend validates env vars at startup via Zod (`src/environment.ts`) and will throw a clear error if any are malformed.

## Running

Start both services in separate terminals:

```bash
cd backend && npm run dev   # http://localhost:3200
cd frontend && npm run dev  # http://localhost:5173
```

## Running tests

```bash
cd frontend && npm test
```

## What was built

**Backend (Express + TypeScript)**

- `GET /images` — fetches a random pelican photo from Unsplash (`/photos/random?query=pelican`) and returns a normalized response: URL, alt text, photographer name, and photographer profile link
- `GET /openapi.json` — serves a generated OpenAPI 3.1 spec

**Frontend (React + TypeScript)**

- Loads an initial pelican image on page load
- **Previous** — navigates back through seen images; shows "No more images!" at the start of history
- **Next** — uses cached images when navigating within history, fetches a new one when at the end
- **Play / Pause** — auto-advances every 2 seconds
- Loading and error states throughout
- History is capped at the 5 most recent images

## Tradeoffs and decisions

**End-to-end type safety via Zod + OpenAPI codegen**

API response types are defined once as Zod schemas on the backend (`backend/src/schemas.ts`). The `@asteasolutions/zod-to-openapi` library generates an OpenAPI 3.1 spec from those schemas, served at `/openapi.json`. The frontend runs `npm run generate:types` to generate TypeScript types from that spec via `openapi-typescript`, and uses `openapi-fetch` for a fully typed HTTP client. This means types can never drift between the backend and frontend — the Zod schema is the single source of truth.

**`useMutation` for all fetches**

Rather than using `useQuery` for the initial load and `useMutation` for subsequent fetches, all image fetches go through a single `useMutation`. This keeps the data flow consistent and avoids syncing React Query's cache into local state, which would require calling setState inside a `useEffect` body (flagged by the project's lint rules). The tradeoff is losing React Query's automatic background refetch and stale-time behavior — acceptable here since each fetch is intentionally a new random image.

**History as local state, not React Query cache**

The "keep last 5 images" ring buffer is managed in component state rather than React Query's cache. React Query's cache is keyed by query key and designed for deduplicating and revalidating the same resource — it doesn't map onto "an ordered sequence of different random images." Local state is the right tool here.

**`tsx` instead of `ts-node`**

The backend dev runner was switched from `ts-node` to `tsx`. `ts-node` has known compatibility issues with `"module": "nodenext"` + `"type": "module"` without extra loader configuration. `tsx` handles ESM natively and adds `--watch` for hot reloading with no extra config.

## What I'd do next with more time

- **Add a visual progress indicator during play** — e.g. a countdown bar between advances so the user knows when the next image is coming
- **Prefetch the next image** in the background while the current one is displayed, eliminating the loading flash on Next
- **Persist history to `sessionStorage`** so navigation survives a page refresh
- **Add a `docker-compose.yml`** for one-command startup

**Storybook for frontend development and integration testing**

Add Storybook so UI components and states can be developed and reviewed without a running backend. Stories would cover every state the slideshow can be in: initial loading, image displayed, error, "No more images!", play mode. The MSW (Mock Service Worker) addon would intercept `GET /images` at the network level, so stories verify the full request/response cycle — correct URL, correct headers, correct parsing of the response — without hitting the real API. This also doubles as a visual regression suite.

**Backend integration tests**

Add a test suite (e.g. with `supertest`) that starts the Express app and exercises `GET /images` end-to-end, with the Unsplash `fetch` call mocked at the module level. This would verify: the route constructs the correct Unsplash URL and authorization header, correctly maps the Unsplash response shape to the API contract, returns 404 when Unsplash returns no results, and returns 502 on a failed upstream call. This is distinct from unit tests — it catches wiring bugs (wrong route registration, missing middleware, etc.) that unit tests miss.

**Auto-generate the OpenAPI spec from route definitions**

The current approach defines Zod schemas manually and registers them with `@asteasolutions/zod-to-openapi`. A better long-term approach would be a library that infers the spec directly from the router — such as `tsoa` (decorators on controller classes auto-generate both routes and the spec) or switching the framework to Hono with `@hono/zod-openapi` (built-in first-class support for Zod + OpenAPI with zero manual registration). Either eliminates the separate schema registration step and keeps the spec guaranteed in sync with the actual route handlers.

**Handle Unsplash rate limit responses**

The Unsplash demo tier allows 50 requests/hour. A 429 response from Unsplash currently surfaces as a generic 502 to the frontend. Instead the backend should detect the 429, return its own 429 with a `Retry-After` header, and the frontend should show a specific "Rate limit reached, try again in X seconds" message rather than a generic error.
