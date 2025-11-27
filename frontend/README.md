# Hive Frontend

Vite + React 19 single-page app that provides the Hive workspace dashboard, editors, and member management UI. It relies on Radix UI primitives, Tailwind, TipTap, and TanStack Query for a responsive authoring experience.

## Requirements

- Node.js 20+
- npm 10+
- Backend API running locally (default `http://localhost:3000`)

## Getting Started

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:

```
VITE_HIVE_API_BASE_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

`VITE_APP_URL` is used for cross-app links (invites, password reset) rendered by the backend email templates.

## Development Workflow

```bash
# Start Vite dev server on http://localhost:5173
npm run dev

# Type-check + production build
npm run build

# Preview the optimized build
npm run preview
```

## Project Structure

- `src/pages/`: Top-level routes (dashboard, posts, members, settings, auth)
- `src/components/`: Shared UI components built atop Radix + Tailwind
- `src/api/`: Axios-based clients that map 1:1 with backend routes
- `src/hooks/`: React hooks (TanStack Query data fetching, auth context, editors)
- `src/lib/env.ts`: Zod schema that validates `import.meta.env`

## Quality Tooling

- `npm run lint`: ESLint 9 with React + TanStack Query plugins
- `npm run prettier`: Repository-wide formatting
- `npm run test`: _(not yet implemented)_ — rely on manual verification for now

## Connecting to the Backend

1. Ensure the backend is running and accessible at `VITE_HIVE_API_BASE_URL`.
2. Sign in via the frontend auth screens. During local development the backend may expose a `DEV_USER_ID` for quick impersonation—see backend docs.
3. Verify real-time changes (posts, tags, invites) by watching TanStack Query caches update; stale data can be manually invalidated via the query devtools if needed.

## Deployment Notes

- Build artifacts land in `dist/`. Deploy to Vercel/Netlify or serve via any static host + reverse-proxy for the API.
- Update `VITE_HIVE_API_BASE_URL` and `VITE_APP_URL` with production URLs before running `npm run build`.
- A sample `vercel.json` is included for edge-friendly defaults.

## License

Released under the MIT License. See the repository root `LICENSE` file.
