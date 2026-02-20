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

**Frontend** — create `frontend/.env.local`:

```bash
echo "VITE_API_URL=http://localhost:3200" > frontend/.env.local
```

The frontend validates env vars at startup via Zod (`src/environment.ts`) and will throw a clear error if any are missing or malformed.

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

- Add a visual progress indicator during play (e.g. a countdown bar between advances)
- Prefetch the next image in the background while the current one is displayed, so there's no loading flash on Next
- Persist history to `sessionStorage` so navigation survives a page refresh
- Expand the test suite: add a smoke test for the rendered UI (`App.test.tsx`), test the play/pause interval behavior with fake timers, and add backend route tests with a mocked Unsplash client
- Add a `docker-compose.yml` for one-command startup
