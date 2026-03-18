# hive-cms SDK Contract (Phase 3)

## Constructor

```ts
new Hive({ apiKey, baseUrl?, version?, fetch? })
```

- `apiKey`: required
- `baseUrl`: optional, defaults to `https://hivecms.online/api/public`
- `version`: optional, defaults to `v1`
- `fetch`: optional custom fetch implementation

## Runtime rule

- If used in a browser-like runtime, the SDK logs a warning.
- It does not throw automatically for browser usage.

## Methods

### Posts

- `posts.list(filters?)`
- `posts.get(postSlug)`

`filters`:

- `offset?: number`
- `limit?: number`
- `category?: string`
- `author?: string`
- `tags?: string[]`

### Tags

- `tags.list()`

### Categories

- `categories.list()`

### Authors

- `authors.list()`

### Stats

- `stats.get()`

## Return behavior

- Returns typed data directly.
- Does not return a wrapped SDK envelope.
- Runtime validation is applied to every endpoint response before returning data.
- If response shape is invalid, the SDK throws `HiveApiError` with code `INVALID_API_RESPONSE`.

## Error behavior

- Throws `HiveApiError` for:
  - non-2xx responses
  - explicit API failure payloads
  - local SDK config errors (for example missing `apiKey`)

`HiveApiError` shape:

- `message: string`
- `status: number`
- `code: string`
- `details?: unknown`
