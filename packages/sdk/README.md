# hive-cms

Type-safe SDK for consuming Hive CMS public API endpoints from Node.js runtimes.

## Documentation

- https://hivecms.online/docs

## Status

Early development.

## Runtime

- Node.js 20+
- Server-side usage only

## Quick Start

Set your API key in server environment:

```bash
HIVE_API_KEY=your_public_api_key
```

Then initialize the SDK without passing `apiKey` manually:

```ts
import { Hive } from "hive-cms";

const hive = new Hive();
const posts = await hive.posts.list({ limit: 10 });
```

If you use a different variable name:

```ts
const hive = new Hive({
  apiKeyEnvVarName: "MY_HIVE_KEY",
});
```

You can still pass `apiKey` directly when needed.

## Build

```bash
pnpm build
```

## Dev Watch

```bash
pnpm dev
```
