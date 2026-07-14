### 1) MVP (ship first)

- DB
  - Add `workspace_api_keys`:
    - `id uuid pk`
    - `workspace_id uuid not null ref workspaces(id)`
    - `name varchar(60) not null`
    - `key_hash varchar(100) not null`
    - `created_by uuid not null ref users(id)`
    - `created_at timestamp not null default now()`
    - `revoked_at timestamp null`
    - `last_used_at timestamp null`
  - Indexes: `(workspace_id)`, `(revoked_at)`, `(last_used_at)`
  - Enforce “max 5 active keys/workspace” in service logic on create.

- Key generation
  - Format: `hive_pk_<32 url-safe chars>`
  - Store only bcrypt hash (cost 12), show raw once on creation.

- Management (owner-only; session auth)
  - `POST /api/workspace/:workspaceSlug/api-keys` → create; returns `{ apiKey, id, name, createdAt }`
  - `GET /api/workspace/:workspaceSlug/api-keys` → list metadata only
  - `DELETE /api/workspace/:workspaceSlug/api-keys/:id` → revoke (soft)

- Public middleware (no rate limit yet)
  - `publicApiKey`: reads `:apiKey` from path, finds active key (bcrypt compare), sets `req.workspaceId`, `req.apiKeyId`, rejects non-GET with 403, updates `last_used_at` async.
  - Query validation for posts: `offset`, `limit` (default 10, max 50), `category`, `tags[]=`, `authorId`, `sort=published_at|title`, `order=asc|desc`.

- Public routes (versioned; apiKey in path; workspace inferred from key)
  - Base: `/api/public/v1/blogs/:apiKey/*` (ref style: [posts], [postBySlug], [categories], [tags], [authors])
  - Attach `publicApiKey` to all
  - `GET /workspace` → `{ success, data: { name, slug, created_at } }`
  - `GET /posts` (metadata only; published AND visible)
    - Filters: `offset`, `limit`, `category`, `tags`, `authorId`, `sort`, `order`
    - Returns `{ success, data: PublicPostMeta[], total, offset, limit }`
    - `PublicPostMeta`: `{ title, slug, excerpt?, category?, tags?, published_at, authors?: [{ id, name }] }`
  - `GET /posts/:slug` (HTML only; published AND visible)
    - Returns `{ success, data: { title, slug, html_content, published_at, excerpt?, category?, tags?, authors?: [{ id, name }] } }`
    - Note: no JSON content in MVP per your spec
  - `GET /categories` → `{ success, data: { name, slug }[], total, offset, limit }`
  - `GET /tags` → same shape as categories
  - `GET /authors` → `{ success, data: { id, name }[], total, offset, limit }`

- Services/queries
  - Public-safe helpers constrained by `workspaceId`, `status='published'`, `visible=true`
  - JOIN category/tags/authors for list and detail
  - Sorting default `published_at desc`

- Errors/shape
  - Success: `{ success: true, data, message?, total?, offset?, limit? }`
  - Errors: `{ success: false, code, message }`
  - Codes: `INVALID_API_KEY`, `REVOKED_API_KEY`, `INVALID_QUERY`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`

- Admin UI (owner)
  - Public API tab: create key (show once), list keys (metadata), revoke key
  - Members/admins: view-only list

- Logging
  - Avoid logging full URL with `:apiKey` visible; mask in logs/metrics

_Rerence_
[posts]: https://www.zenblog.com/docs/api/posts
[postBySlug]: https://www.zenblog.com/docs/api/postBySlug
[categories]: https://www.zenblog.com/docs/api/categories
[tags]: https://www.zenblog.com/docs/api/tags
[authors]: https://www.zenblog.com/docs/api/posts

---

### 2) Later (incremental hardening and features)

- Scopes and constraints (granular control)
  - Tables:
    - `workspace_api_key_scopes`:
      - `api_key_id uuid pk/fk`
      - `allow_posts boolean default true`
      - `allow_categories boolean default true`
      - `allow_tags boolean default true`
      - `allow_authors boolean default true`
    - `workspace_api_key_constraints`:
      - `api_key_id uuid pk/fk`
      - `allowed_tag_slugs text[] default '{}'`
      - `allowed_category_slugs text[] default '{}'`
      - `allowed_author_ids uuid[] default '{}'`
  - Middleware enforces:
    - If client requests filters outside allowed sets → 403 `FORBIDDEN_SCOPE`
    - If no filters given but constraints exist → apply WHERE IN constraints

- Archives
  - Add `status='archived'` to `postsTable` (or a separate boolean)
  - `GET /archive` (metadata list) and `GET /archive/:slug` (HTML detail), both respecting constraints

- Rate limiting
  - Add `PUBLIC_API_RATE_LIMIT` and `PUBLIC_API_RATE_WINDOW_SECONDS`
  - Per key (or per workspace) fixed window or token bucket
  - 429 on exceed; add `X-RateLimit-*` headers

- Caching
  - Add `Cache-Control` for lists (60s) and details (300s); ETag/Last-Modified via `updated_at`

- SDK/docs
  - Provide tiny TS client mirroring Zenblog usage examples
  - OpenAPI/JSON Schema generation for the public endpoints
  - Example snippets for filters/sorting/pagination

- Security/ops
  - Optional: embed short key id in plaintext to narrow DB lookup before bcrypt
  - Key rotation endpoint (create new → revoke old)
  - Audit log of key usage (aggregate counts per day)

- Data model enhancements
  - Authors: consider adding `slug`, `image_url`, `twitter`, `website`, `bio` for richer public data
  - Posts detail: optionally add `content_json` in the future if needed by consumers

- Monitoring
  - Basic metrics: request counts per endpoint/key, error rates, P95 latency
