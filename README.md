# Hive

Full-stack headless content collaboration platform composed of an Express/Drizzle API (`backend/`) and a Vite/React client (`frontend/`). The codebase is organized as a lightweight monorepo where each package can be developed independently while sharing a common architecture and conventions.

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
   - Copy `backend/.env.example` to `backend/.env` and fill values.
   - Copy `frontend/.env.example` to `frontend/.env` and fill values.
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

| Variable                        | Required | Description                                                                 |
| ------------------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`                  | ✅       | Full Postgres connection string                                             |
| `PORT`                          | ✅       | API port (e.g., `3000`)                                                     |
| `NODE_ENV`                      | ✅       | `development` / `production`                                                |
| `FRONTEND_URL`                  | ✅       | Allowed origin for CORS + auth links                                        |
| `RESEND_API_KEY`                | ✅       | API key for Resend transactional emails                                     |
| `EMAIL_DOMAIN`                  | ✅       | Domain used for transactional senders                                       |
| `R2_ACCOUNT_ID`                 | ✅       | Cloudflare R2 account id                                                    |
| `R2_ACCESS_KEY_ID`              | ✅       | R2 access key id                                                            |
| `R2_SECRET_ACCESS_KEY`          | ✅       | R2 secret key                                                               |
| `R2_BUCKET_NAME`                | ✅       | R2 bucket for media uploads                                                 |
| `R2_PUBLIC_URL`                 | ✅       | Public base URL for uploaded media                                          |
| `AZURE_FUNCTION_SECRET`         | ✅       | Shared secret used when calling Azure Functions                             |
| `AZURE_THUMBHASH_FUNCTION_URL`  | ✅       | URL of thumbhash generation Azure Function                                  |
| `AI_ENCRYPTION_KEY`             | ✅       | Server-side encryption key for per-user BYOK Gemini keys (keep stable)      |
| `DMA`                           | optional | Enable DMA-specific safeguards (defaults to `false`)                        |
| `DEV_USER_ID`                   | optional | Seeded ID used for local fixtures                                           |

Example:

Use `backend/.env.example` as the source of truth for backend env setup.

### Frontend (`frontend/.env`)

| Variable                 | Required | Description                                                  |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `VITE_HIVE_API_BASE_URL` | ✅       | Base URL for the backend API (e.g., `http://localhost:3000`) |
| `VITE_APP_URL`           | ✅       | Public URL the SPA runs on (used in deep links)              |

Example:

Use `frontend/.env.example` as the source of truth for frontend env setup.

## BYOK AI (Gemini)

- Keys are configured by users at `/profile?ai`.
- Keys are encrypted server-side before storage (`user_ai_settings` table).
- The raw key is never returned to the frontend after save.
- AI features currently include:
  - Post analysis in the editor sidebar.
  - Selection-based rewrite tools in the editor (grammar, concise, elaborate, tone).

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
