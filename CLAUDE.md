# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack TypeScript monorepo with two independent packages:

- **`frontend/`** — React 19 + Vite SPA. Entry point: `src/main.tsx`. The single `App` component fetches from the backend and renders the response.
- **`backend/`** — Express 5 HTTP server with CORS. Entry point: `src/index.ts`. Runs on port `3200`.

The frontend calls `http://localhost:3200` directly (hardcoded in `frontend/src/App.tsx`). Both services must run concurrently during development.

## Commands

Each package is developed independently. Run all commands from the respective subdirectory.

**Frontend** (`cd frontend`):

```
npm install       # install deps
npm run dev       # start Vite dev server
npm run build     # type-check + build
npm run lint      # ESLint
npm run preview   # preview production build
```

**Backend** (`cd backend`):

```
npm install       # install deps
npm run dev       # run with ts-node
```

## TypeScript Configuration

The backend `tsconfig.json` uses strict settings including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Keep these constraints in mind when writing backend code — array element access returns `T | undefined`, and optional properties must be handled exactly.

## Self-Documenting Code

- **Never use explanatory comments for code blocks**: If you need a comment to explain what a block of code does, extract it into a well-named function/method instead
- Function and method names should clearly communicate their purpose
- Comments should explain _why_, not _what_

### Examples

❌ **Bad:**

```python
# Extract s3_key from either keyword or positional arguments
s3_key = kwargs.get('s3_key')
if s3_key is None:
    for arg in args:
        if isinstance(arg, str):
            s3_key = arg
            break
```

✅ **Good:**

```python
def extract_s3_key_from_args(args: tuple, kwargs: dict) -> str | None:
    s3_key = kwargs.get('s3_key')
    if s3_key is None:
        for arg in args:
            if isinstance(arg, str):
                return arg
    return s3_key

s3_key = extract_s3_key_from_args(args, kwargs)
```
