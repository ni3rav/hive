# Hive Backend

TypeScript/Express 5 API that powers the Hive content workspace. It exposes
modules for authentication, workspaces, members, posts, authors, tags, and
invitations while handling transactional emails (password reset, verification,
workspace invites) via Resend.

## Requirements

- Node.js 20+
- pnpm 11+
- PostgreSQL 15+ (local install or Docker)
- Resend API key for email delivery

## Getting Started

```bash
cd apps/backend
# (Optional) Spin up a Postgres helper container
docker run --name hive-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
```

Create a `.env` file in `apps/backend/`:

| Variable         | Required | Description                                                        |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL`   | yes      | `postgres://user:pass@host:5432/dbname`                            |
| `PORT`           | yes      | Port for Express (defaults to 3000)                                |
| `NODE_ENV`       | yes      | `development` / `production`                                       |
| `FRONTEND_URL`   | yes      | SPA origin for CORS + auth links                                   |
| `RESEND_API_KEY` | yes      | Resend API key for email templates                                 |
| `DMA`            | no       | Enables DMA defensive checks (`false` by default)                  |
| `DEV_USER_ID`    | no       | Seed user ID for local debugging                                   |
| `EMAIL_DOMAIN`   | no       | Domain used for transactional senders (`emails.ni3rav.me` default) |

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

- **Push latest schema:** `pnpm drizzle-push`
- **Generate migration from schema changes:** `pnpm generate`
- **Apply pending migrations:** `pnpm migrate`
- **Inspect data:** `pnpm drizzle-studio`

The full SQL history lives under `drizzle/`. Every change should come with a new
migration file so environments remain reproducible.

## Running the API

You can run these scripts directly from this directory, or from the monorepo
root using `--filter backend`.

```bash
# Development (ts-node + nodemon)
pnpm dev

# Production build
pnpm build
pnpm start
```

By default the dev server listens on `http://localhost:3000`. Update
`VITE_HIVE_API_BASE_URL` in the frontend to match if you change ports.

## Useful Scripts

| Script          | Purpose                   |
| --------------- | ------------------------- |
| `pnpm lint`     | ESLint over `src/**/*.ts` |
| `pnpm prettier` | Format source files       |
| `pnpm dev`      | Watch mode server         |
| `pnpm build`    | Emit `dist/`              |
| `pnpm start`    | Run compiled server       |

## Testing the API

- **REST tooling**: Use Thunder Client, Postman, or curl. Each module exposes
  routes under `/api/<module>`. See `src/routes/*` for exact paths.
- **Auth flows**: Verify register/login/password-reset + email verification.
  Transactional emails leverage Resend; when `RESEND_API_KEY` is not set,
  handlers will throw early—mock responses if needed.
- **Workspace actions**: Exercise workspace creation, member invites, and role
  checks in `middleware/workspace-role.ts`.

## Troubleshooting

- **Migrations fail**: Confirm the database container is running and accessible
  via `psql`. Re-run `pnpm drizzle-push`.
- **CORS blocked**: Ensure `FRONTEND_URL` matches the actual origin (including
  protocol and port).
- **Email delivery**: Verify the Resend domain is verified; in local dev you can
  temporarily stub `send*Email` helpers under `src/utils/email.ts`.

## License

Released under the MIT License. See the repository root `LICENSE` file for
details.
