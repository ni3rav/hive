# API Versioning Migration Guide

This guide explains how to create a new version of the public API when breaking
changes are needed.

## When to Create a New Version

Create a new version when you need to make **breaking changes**:

- Removing or renaming response fields
- Changing endpoint behavior or filtering logic
- Making optional parameters required
- Changing response structure/envelope
- Removing endpoints

**Don't create a new version for:**

- Adding new optional fields to responses
- Adding new optional query parameters
- Bug fixes that correct behavior
- Performance improvements
- Adding completely new endpoints (just add to existing version)

---

## Scenario 1: Migrate ONE Endpoint to V2

**Example:** You want to change the `/posts` endpoint but keep all others the
same.

### Step 1: Create V2 Controller (Only for Changed Endpoint)

Create `src/controllers/public-v2.ts`:

```typescript
import { Request, Response } from 'express';
// Import whatever you need for the new logic

export async function listPublicPostsControllerV2(req: Request, res: Response) {
  // NEW LOGIC HERE
  // Different filtering, different response shape, etc.
}
```

### Step 2: Create V2 DTO (If Response Changed)

Create `src/dto/public.v2.dto.ts`:

```typescript
// Only define what changed
export type PublicPostSummaryDtoV2 = {
  // New fields, renamed fields, etc.
};

export function toPublicPostSummaryDtoV2(...) {
  // Transform logic
}
```

### Step 3: Create V2 Router (Reuse V1 for Unchanged Endpoints)

Create `src/routes/public-v2.ts`:

```typescript
import { Router } from 'express';
import { listPublicPostsControllerV2 } from '../controllers/public-v2'; // NEW
import {
  getPublicPostController, // REUSE from v1
  listPublicTagsController, // REUSE from v1
  listPublicCategoriesController, // REUSE from v1
  listPublicAuthorsController, // REUSE from v1
  getPublicStatsController, // REUSE from v1
} from '../controllers/public';

export const publicResourcesRouterV2 = Router({ mergeParams: true });

// Changed endpoint
publicResourcesRouterV2.get('/posts', listPublicPostsControllerV2);

// Unchanged endpoints (reuse v1 controllers)
publicResourcesRouterV2.get('/posts/:postSlug', getPublicPostController);
publicResourcesRouterV2.get('/tags', listPublicTagsController);
publicResourcesRouterV2.get('/categories', listPublicCategoriesController);
publicResourcesRouterV2.get('/authors', listPublicAuthorsController);
publicResourcesRouterV2.get('/stats', getPublicStatsController);
```

### Step 4: Register V2 in Version Manager

Update `src/utils/version-manager.ts`:

```typescript
export const SUPPORTED_API_VERSIONS = {
  V1: 'v1',
  V2: 'v2', // ADD THIS
} as const;

export const VERSION_CONFIG: Record<string, VersionConfigItem> = {
  v1: {
    status: 'stable',
    deprecatedAt: null,
    sunsetAt: null,
    migration: null,
  },
  v2: {
    // ADD THIS
    status: 'stable',
    deprecatedAt: null,
    sunsetAt: null,
    migration: null,
  },
};
```

### Step 5: Register V2 in Main Router

Update `src/routes/public.ts`:

```typescript
import { publicResourcesRouterV2 } from './public-v2'; // ADD THIS

// In the switch statement:
switch (req.params.apiVersion) {
  case 'v1':
    return publicResourcesRouterV1(req, res, next);
  case 'v2': // ADD THIS
    return publicResourcesRouterV2(req, res, next);
  default:
    return notFound(res, 'Version not found');
}
```

### Step 6: Test

```bash
# V1 still works (old behavior)
curl "http://localhost:3000/api/public/v1/YOUR_KEY/posts"

# V2 works (new behavior for posts)
curl "http://localhost:3000/api/public/v2/YOUR_KEY/posts"

# V2 reuses v1 for tags
curl "http://localhost:3000/api/public/v2/YOUR_KEY/tags"
```

---

## Scenario 2: Migrate ALL Endpoints to V2

**Example:** You're changing response format for everything.

### Step 1: Create V2 Controllers for All Endpoints

Create `src/controllers/public-v2.ts`:

```typescript
export async function listPublicPostsControllerV2(req, res) {
  /* ... */
}
export async function getPublicPostControllerV2(req, res) {
  /* ... */
}
export async function listPublicTagsControllerV2(req, res) {
  /* ... */
}
export async function listPublicCategoriesControllerV2(req, res) {
  /* ... */
}
export async function listPublicAuthorsControllerV2(req, res) {
  /* ... */
}
export async function getPublicStatsControllerV2(req, res) {
  /* ... */
}
```

### Step 2: Create V2 DTOs

Create `src/dto/public.v2.dto.ts` with all new response shapes.

### Step 3: Create V2 Router (All New)

Create `src/routes/public-v2.ts`:

```typescript
import { Router } from 'express';
import {
  listPublicPostsControllerV2,
  getPublicPostControllerV2,
  listPublicTagsControllerV2,
  listPublicCategoriesControllerV2,
  listPublicAuthorsControllerV2,
  getPublicStatsControllerV2,
} from '../controllers/public-v2'; // ALL NEW

export const publicResourcesRouterV2 = Router({ mergeParams: true });

publicResourcesRouterV2.get('/posts', listPublicPostsControllerV2);
publicResourcesRouterV2.get('/posts/:postSlug', getPublicPostControllerV2);
publicResourcesRouterV2.get('/tags', listPublicTagsControllerV2);
publicResourcesRouterV2.get('/categories', listPublicCategoriesControllerV2);
publicResourcesRouterV2.get('/authors', listPublicAuthorsControllerV2);
publicResourcesRouterV2.get('/stats', getPublicStatsControllerV2);
```

### Step 4-6: Same as Scenario 1

Follow steps 4-6 from Scenario 1 to register and test.

---

## Deprecating V1

Once V2 is stable and ready, deprecate V1 with a grace period.

### Step 1: Update Version Config

Update `src/utils/version-manager.ts`:

```typescript
v1: {
  status: 'deprecated',
  deprecatedAt: '2026-06-01T00:00:00Z', // Today
  sunsetAt: '2026-12-31T23:59:59Z',     // 6 months from now
  migration: 'v2',                       // Tell users where to go
},
```

### Step 2: Communicate to Users

- Email all API key holders
- Update documentation
- Post in dashboard/announcements

### Step 3: Monitor Headers

V1 endpoints now automatically return:

```
Deprecation: true
Sunset: Tue, 31 Dec 2026 23:59:59 GMT
X-API-Suggest: v2
```

Users should monitor these headers and plan migration.

### Step 4: After Sunset Date

After `2026-12-31`, the middleware automatically returns:

```json
{
  "success": false,
  "code": "GONE",
  "message": "API version v1 is no longer supported",
  "migrate_to": "v2",
  "sunset_date": "2026-12-31T23:59:59Z"
}
```

Status: `410 Gone`

---

## File Structure Reference

```
backend/src/
├── routes/
│   ├── public.ts           # Main dispatcher (updated for each version)
│   ├── public-v1.ts        # V1 endpoints
│   └── public-v2.ts        # V2 endpoints (NEW)
├── controllers/
│   ├── public.ts           # V1 controllers (can stay as-is)
│   └── public-v2.ts        # V2 controllers (NEW, or partial if reusing)
├── dto/
│   ├── public.dto.ts       # V1 DTOs
│   └── public.v2.dto.ts    # V2 DTOs (NEW)
├── middleware/
│   ├── api-version.ts      # Version validation (no changes needed)
│   └── public-api-key.ts   # API key auth (no changes needed)
└── utils/
    └── version-manager.ts  # Version config (add v2 here)
```

---

## Testing Checklist

Before deploying a new version:

- [ ] All V2 endpoints return expected responses
- [ ] V1 endpoints still work (no regressions)
- [ ] Invalid version returns 404
- [ ] Deprecated version returns correct headers
- [ ] Sunset version returns 410 Gone
- [ ] TypeScript compiles without errors
- [ ] Documentation updated (see below)

---

## Documentation Updates

When releasing a new version, update:

1. **Backend docs** (this guide - add notes about what changed)
2. **Frontend docs** in `/docs/content/docs/`:
   - `versioning.mdx` - Add migration guide section
   - All endpoint docs - Add v2 examples if needed
   - `troubleshooting.mdx` - Note any new error scenarios
3. **API_ROADMAP.md** - Document what changed and why

---

## Quick Command Reference

```bash
# Test v1 still works
curl "http://localhost:3000/api/public/v1/YOUR_KEY/posts"

# Test v2 works
curl "http://localhost:3000/api/public/v2/YOUR_KEY/posts"

# Test invalid version
curl "http://localhost:3000/api/public/v99/YOUR_KEY/posts"
# Should return 404

# Check TypeScript
npm run build

# Run tests
npm test
```

---

## Key Principles

1. **Each version is independent** - V2 doesn't modify V1 files
2. **Reuse what's identical** - Don't duplicate unchanged logic
3. **Communicate early** - Give users 3-6 months to migrate
4. **Test thoroughly** - Both versions should work during transition
5. **Document everything** - Users need clear migration guides

---

## Example: Real V1 → V2 Migration

**What changed:** Posts endpoint now returns `created_at` instead of
`publishedAt`

**Files created/modified:**

1. Created `dto/public.v2.dto.ts` with new `PostSummaryDtoV2`
2. Created `controllers/public-v2.ts` with `listPublicPostsControllerV2`
3. Created `routes/public-v2.ts` (reused v1 for other endpoints)
4. Updated `utils/version-manager.ts` to add v2
5. Updated `routes/public.ts` to add v2 case
6. Updated docs to explain the change

**Timeline:**

- Day 1: Deploy v2, v1 still stable
- Day 30: Mark v1 as deprecated (set dates in version-manager.ts)
- Day 180: v1 sunset (410 Gone), only v2 works

---

## Need Help?

If you're unsure whether a change needs a new version, ask:

1. Will this break existing client code?
2. Will clients need to update their integration?

If yes to either → new version. If no → safe to add to current version.
