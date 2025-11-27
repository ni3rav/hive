# Hive Backend

TypeScript/Express 5 API that powers the Hive content workspace. It exposes
modules for authentication, workspaces, members, posts, authors, tags, and
invitations while handling transactional emails (password reset, verification,
workspace invites) via Resend.

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (local install or Docker)
- Resend API key for email delivery

## Getting Started

```bash
cd backend
npm install
# optional helper for Postgres
docker run --name hive-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
```

Create a `.env` file in `backend/`:

| Variable         | Required | Description                                                        |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL`   | ✅       | `postgres://user:pass@host:5432/dbname`                            |
| `PORT`           | ✅       | Port for Express (defaults to 3000)                                |
| `NODE_ENV`       | ✅       | `development` / `production`                                       |
| `FRONTEND_URL`   | ✅       | SPA origin for CORS + auth links                                   |
| `RESEND_API_KEY` | ✅       | Resend API key for email templates                                 |
| `DMA`            | optional | Enables DMA defensive checks (`false` by default)                  |
| `DEV_USER_ID`    | optional | Seed user ID for local debugging                                   |
| `EMAIL_DOMAIN`   | optional | Domain used for transactional senders (`emails.ni3rav.me` default) |

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

## Database Management

- **Push latest schema:** `npm run drizzle-push`
- **Generate migration from schema changes:** `npm run generate`
- **Apply pending migrations:** `npm run migrate`
- **Inspect data:** `npm run drizzle-studio`

The full SQL history lives under `drizzle/`. Every change should come with a new
migration file so environments remain reproducible.

## Running the API

```bash
# Development (ts-node + nodemon)
npm run dev

# Production build
npm run build
npm run start
```

By default the dev server listens on `http://localhost:3000`. Update
`VITE_HIVE_API_BASE_URL` in the frontend to match if you change ports.

## Useful Scripts

| Script             | Purpose                   |
| ------------------ | ------------------------- |
| `npm run lint`     | ESLint over `src/**/*.ts` |
| `npm run prettier` | Format source files       |
| `npm run dev`      | Watch mode server         |
| `npm run build`    | Emit `dist/`              |
| `npm run start`    | Run compiled server       |

## Testing the API

- **REST tooling**: use Thunder Client, Postman, or curl. Each module exposes
  routes under `/api/<module>`. See `src/routes/*` for exact paths.
- **Auth flows**: verify register/login/password-reset + email verification.
  Transactional emails leverage Resend; when `RESEND_API_KEY` is not set,
  handlers will throw early—mock responses if needed.
- **Workspace actions**: exercise workspace creation, member invites, and role
  checks in `middleware/workspace-role.ts`.

## Troubleshooting

- **Migrations fail**: confirm the database container is running and accessible
  via `psql`. Re-run `npm run drizzle-push`.
- **CORS blocked**: ensure `FRONTEND_URL` matches the actual origin (including
  protocol and port).
- **Email delivery**: verify the Resend domain is verified; in local dev you can
  temporarily stub `send*Email` helpers under `src/utils/email.ts`.

## License

Released under the MIT License. See the repository root `LICENSE` file for
details.
