# Hive

Full-stack content collaboration platform composed of an Express/Drizzle API (`backend/`) and a Vite/React client (`frontend/`). The codebase is organized as a lightweight monorepo where each package can be developed independently while sharing a common architecture and conventions.

## Architecture at a Glance

- **Backend** (`backend/`): Express 5 server with modular controllers for authentication, workspace membership, posts, authors, categories, tags, and invitations. Uses Drizzle ORM for schema migrations, Pino for structured logging, Resend for transactional email templates, and Zod-powered DTO validation.
- **Frontend** (`frontend/`): Vite + React 19 SPA styled with Tailwind, Radix UI, and motion libraries. State and server cache are driven by TanStack Query; forms rely on React Hook Form + Zod. Rich text editing is provided by TipTap.
- **Database**: PostgreSQL. The repo includes Docker instructions and Drizzle migrations (`backend/drizzle/`) for reproducible schema management.
- **Email + Notifications**: Reusable templates under `backend/src/templates` for password resets, verification, and workspace invitations sent through Resend.

## Prerequisites

- Node.js 20+ (backend uses ts-node/nodemon, frontend targets Vite 7)
- npm 10+ (lockfiles assume npm; switch to pnpm/yarn only if you regenerate locks)
- Docker Desktop or a local PostgreSQL 15+ instance
- Resend API key for transactional emails

## Repository Layout

```
.
├── backend/   # Express API, Drizzle migrations, email templates
├── frontend/  # Vite + React client
├── LICENSE
└── README.md  # You are here
```

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/ni3rav/hive hive && cd hive
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Provision PostgreSQL (Docker example)**
   ```bash
   docker run --name hive-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:16
   ```
3. **Configure environment**
   - Backend `.env` (see table below) inside `backend/`
   - Frontend `.env` inside `frontend/`
4. **Apply database schema**
   ```bash
   cd backend
   npm run drizzle-push
   ```
5. **Run services**
   - Backend: `npm run dev` (default on port 3000)
   - Frontend: `npm run dev` (default on port 5173) with `VITE_HIVE_API_BASE_URL` pointing to the backend URL

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Required | Description                                          |
| ---------------- | -------- | ---------------------------------------------------- |
| `DATABASE_URL`   | ✅       | Full Postgres connection string                      |
| `PORT`           | ✅       | API port (e.g., `3000`)                              |
| `NODE_ENV`       | ✅       | `development` / `production`                         |
| `FRONTEND_URL`   | ✅       | Allowed origin for CORS + auth links                 |
| `RESEND_API_KEY` | ✅       | API key for Resend transactional emails              |
| `DMA`            | optional | Enable DMA-specific safeguards (defaults to `false`) |
| `DEV_USER_ID`    | optional | Seeded ID used for local fixtures                    |
| `EMAIL_DOMAIN`   | optional | Domain used for transactional senders (`emails.ni3rav.me` by default) |

Example:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_123
DMA=false
DEV_USER_ID=
EMAIL_DOMAIN=emails.ni3rav.me
```

### Frontend (`frontend/.env`)

| Variable                 | Required | Description                                                  |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `VITE_HIVE_API_BASE_URL` | ✅       | Base URL for the backend API (e.g., `http://localhost:3000`) |
| `VITE_APP_URL`           | ✅       | Public URL the SPA runs on (used in deep links)              |

Example:

```
VITE_HIVE_API_BASE_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

## Helpful Scripts

| Location | Script                           | Purpose                                       |
| -------- | -------------------------------- | --------------------------------------------- |
| backend  | `npm run dev`                    | Start Express API with ts-node + nodemon      |
| backend  | `npm run build && npm run start` | Compile TypeScript and launch compiled server |
| backend  | `npm run drizzle-push`           | Apply latest Drizzle schema                   |
| backend  | `npm run drizzle-studio`         | Open Drizzle Studio for DB inspection         |
| frontend | `npm run dev`                    | Start Vite dev server                         |
| frontend | `npm run build`                  | Build production assets                       |
| frontend | `npm run preview`                | Preview production build locally              |

## Testing & Quality

- **Linting**: `npm run lint` in both packages (ESLint 9)
- **Formatting**: `npm run prettier`
- **Type safety**: TypeScript strict configs enforced during build
- There are currently no automated integration tests; rely on manual verification of core flows (auth, workspace management, post publishing) after schema or API changes.

## Additional Docs

- `backend/README.md`: API service setup, database scripts, Docker helpers
- `frontend/README.md`: SPA development workflow and environment configuration
- `backend/API_ROADMAP.md`: Open roadmap for future endpoints

## License

Distributed under the MIT License. See `LICENSE` for details.
