# Hive

A full-stack, headless content management system.

## Architecture at a Glance

### Applications (`apps/`)

- **Backend** (`apps/backend`): Express 5 server handling authentication, workspaces, posts, authors, tags, and invitations. Powered by Drizzle ORM (PostgreSQL), Pino for logging, and Resend for transactional email.
- **Frontend** (`apps/frontend`): Vite + React 19 SPA styled with Tailwind CSS and Radix UI. Leverages TanStack Query for cache management, React Hook Form + Zod for forms, and TipTap for rich text editing.
- **Docs** (`apps/docs`): Next.js and Fumadocs developer documentation site.
- **Functions** (`apps/functions`): Serverless Azure Functions for image hashing (thumbhash generation).

### Shared Packages (`packages/`)

- **SDK** (`packages/sdk`): A type-safe Node.js SDK (`hive-cms`) for consuming the Hive public API.
- **Types** (`packages/types`): Shared TypeScript definitions and Zod schemas.
- **Query Params** (`packages/query-params`): Query parameter parsing utilities.
- **Theme** (`packages/theme`): Shared styling tokens and components.
- **tsconfig** (`packages/tsconfig`): Monorepo TypeScript configurations.

## Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL 15+ (local or Docker)
- Resend API key for transactional emails
- Cloudflare R2 / S3-compatible credentials for media uploads

## Repository Layout

```
.
├── apps/
│   ├── backend/   # Express API, Drizzle migrations, email templates
│   ├── docs/      # Documentation website (Next.js/Fumadocs)
│   ├── frontend/  # Vite + React client
│   └── functions/ # Azure Functions (Thumbhash generator)
├── packages/
│   ├── query-params/ # Shared query params parser
│   ├── sdk/          # Node.js SDK for Hive CMS public API (hive-cms)
│   ├── theme/        # Shared Tailwind theme tokens
│   ├── tsconfig/     # Shared TS configs
│   └── types/        # Shared TypeScript types and Zod schemas
├── LICENSE
├── package.json
└── README.md
```

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/ni3rav/hive hive && cd hive
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Provision PostgreSQL**

   ```bash
   docker run --name hive-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:16
   ```

4. **Configure environment**
   - Copy `apps/backend/.env.example` to `apps/backend/.env` and update the values.
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env` and update the values.

5. **Apply database schema**

   ```bash
   pnpm --filter backend drizzle-migrate
   ```

6. **Run development services**
   ```bash
   pnpm dev
   ```
   This will boot the Express API (port 3000), frontend client (port 5173), and the documentation site (port 5555) concurrently.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable                       | Required | Description                                                            |
| ------------------------------ | -------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`                 | yes      | Full Postgres connection string                                        |
| `PORT`                         | yes      | API port (e.g., `3000`)                                                |
| `NODE_ENV`                     | yes      | `development` / `production`                                           |
| `FRONTEND_URL`                 | yes      | Allowed origin for CORS + auth links                                   |
| `RESEND_API_KEY`               | yes      | API key for Resend transactional emails                                |
| `EMAIL_DOMAIN`                 | yes      | Domain used for transactional senders                                  |
| `R2_ACCOUNT_ID`                | yes      | Cloudflare R2 account id                                               |
| `R2_ACCESS_KEY_ID`             | yes      | R2 access key id                                                       |
| `R2_SECRET_ACCESS_KEY`         | yes      | R2 secret key                                                          |
| `R2_BUCKET_NAME`               | yes      | R2 bucket for media uploads                                            |
| `R2_PUBLIC_URL`                | yes      | Public base URL for uploaded media                                     |
| `AZURE_FUNCTION_SECRET`        | yes      | Shared secret used when calling Azure Functions                        |
| `AZURE_THUMBHASH_FUNCTION_URL` | yes      | URL of thumbhash generation Azure Function                             |
| `AI_ENCRYPTION_KEY`            | yes      | Server-side encryption key for per-user BYOK Gemini keys (keep stable) |
| `DMA`                          | no       | Enable DMA-specific safeguards (defaults to `false`)                   |
| `DEV_USER_ID`                  | no       | Seeded ID used for local fixtures                                      |

Use `apps/backend/.env.example` as the source of truth for backend env setup.

### Frontend (`apps/frontend/.env`)

| Variable                 | Required | Description                                                  |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `VITE_HIVE_API_BASE_URL` | yes      | Base URL for the backend API (e.g., `http://localhost:3000`) |
| `VITE_APP_URL`           | yes      | Public URL the SPA runs on (used in deep links)              |

Use `apps/frontend/.env.example` as the source of truth for frontend env setup.

## BYOK AI (Gemini)

- Keys are configured by users at `/profile?ai`.
- Keys are encrypted server-side before storage (`user_ai_settings` table).
- The raw key is never returned to the frontend after save.
- AI features currently include:
  - Post analysis in the editor sidebar.
  - Selection-based rewrite tools in the editor (grammar, concise, elaborate, tone).

## Monorepo Commands

The repository is managed using Turborepo and pnpm. You can run workspace-wide tasks or target specific packages:

### Global Commands (run from root)

| Command          | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Start all apps concurrently in development mode |
| `pnpm build`     | Build all packages and applications             |
| `pnpm lint`      | Lint the entire workspace                       |
| `pnpm typecheck` | Run type-checking across all projects           |
| `pnpm format`    | Format the entire codebase with Prettier        |

### Project-Specific Commands

Use the `--filter` flag to target a package:

| Command                                | Purpose                                      |
| -------------------------------------- | -------------------------------------------- |
| `pnpm --filter backend drizzle-push`   | Push schema changes directly to the database |
| `pnpm --filter backend drizzle-studio` | Open Drizzle Studio for DB inspection        |
| `pnpm --filter sdk build`              | Build only the SDK package                   |

## Testing & Quality

- **Linting**: `pnpm lint` runs ESLint across the workspace.
- **Formatting**: `pnpm format` runs Prettier.
- **Type safety**: TypeScript strict configuration is validated via `pnpm typecheck`.
- Core authentication, workspace management, and post publishing require manual validation post-schema-updates.

## Additional Documentation

- `apps/backend/README.md`: API configuration, database migrations, and setup details.
- `apps/frontend/README.md`: Frontend development architecture and routing structures.

## License

Distributed under the MIT License. See `LICENSE` for details.
