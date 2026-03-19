import test from "node:test";
import assert from "node:assert/strict";

import { Hive, HiveApiError } from "../dist/index.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("constructor throws for missing apiKey", () => {
  assert.throws(
    () => new Hive({ apiKey: "" }),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.code, "INVALID_SDK_CONFIG");
      return true;
    },
  );
});

test("logs browser warning once when window is present", () => {
  const originalWindow = globalThis.window;
  const originalWarn = console.warn;
  const calls = [];

  globalThis.window = {};
  console.warn = (...args) => calls.push(args.join(" "));

  try {
    // Uses custom fetch to avoid real network call in constructor + method calls.
    const fetchMock = async () => jsonResponse({ data: [] });
    const a = new Hive({ apiKey: "k", fetch: fetchMock });
    const b = new Hive({ apiKey: "k", fetch: fetchMock });
    assert.ok(a);
    assert.ok(b);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /server-side usage only/i);
  } finally {
    console.warn = originalWarn;
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});

test("exposes selectable base URLs and versions on Hive", () => {
  assert.ok(Array.isArray(Hive.BASE_URLS));
  assert.ok(Array.isArray(Hive.VERSIONS));
  assert.ok(Hive.BASE_URLS.length > 0);
  assert.ok(Hive.VERSIONS.includes("v1"));
});

test("posts.list returns typed list and forwards query params", async () => {
  const requested = [];
  const fetchMock = async (url) => {
    requested.push(String(url));
    return jsonResponse({
      data: [
        {
          title: "Post",
          slug: "post",
          excerpt: "Excerpt",
          publishedAt: "2026-03-18T00:00:00.000Z",
          updatedAt: "2026-03-18T00:00:00.000Z",
          category: { name: "Cat", slug: "cat" },
          tags: [{ name: "Tag", slug: "tag" }],
          author: { id: "a1", name: "Author" },
        },
      ],
      total: 1,
      offset: 2,
      limit: 5,
    });
  };

  const client = new Hive({
    apiKey: "hive-test-key",
    baseUrl: "https://example.com/api/public/",
    version: "v1",
    fetch: fetchMock,
  });

  const result = await client.posts.list({
    offset: 2,
    limit: 5,
    category: "cat",
    author: "a1",
    tags: ["tag", "another"],
  });

  assert.equal(result.total, 1);
  assert.equal(result.data[0].slug, "post");
  assert.equal(requested.length, 1);
  assert.equal(
    requested[0],
    "https://example.com/api/public/v1/hive-test-key/posts?offset=2&limit=5&category=cat&author=a1&tags=tag%2Canother",
  );
});

test("posts.get encodes slug and returns detail", async () => {
  const requested = [];
  const fetchMock = async (url) => {
    requested.push(String(url));
    return jsonResponse({
      title: "Post",
      slug: "hello world",
      excerpt: "Excerpt",
      publishedAt: null,
      updatedAt: null,
      category: null,
      tags: [],
      author: null,
      htmlContent: "<p>Hello</p>",
    });
  };

  const client = new Hive({
    apiKey: "my key",
    baseUrl: "https://example.com/api/public",
    fetch: fetchMock,
  });
  const result = await client.posts.get("hello world");

  assert.equal(result.htmlContent, "<p>Hello</p>");
  assert.equal(
    requested[0],
    "https://example.com/api/public/v1/my%20key/posts/hello%20world",
  );
});

test("supports custom version string in endpoint path", async () => {
  const requested = [];
  const client = new Hive({
    apiKey: "my-key",
    baseUrl: "https://example.com/api/public",
    version: "v2-beta",
    fetch: async (url) => {
      requested.push(String(url));
      return jsonResponse({
        totalPosts: 1,
        totalAuthors: 1,
        totalCategories: 1,
        totalTags: 1,
      });
    },
  });

  await client.stats.get();
  assert.equal(
    requested[0],
    "https://example.com/api/public/v2-beta/my-key/stats",
  );
});

test("tags.list parses wrapped data array", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () => jsonResponse({ data: [{ name: "Tag", slug: "tag" }] }),
  });

  const tags = await client.tags.list();
  assert.deepEqual(tags, [{ name: "Tag", slug: "tag" }]);
});

test("categories.list parses wrapped data array", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () =>
      jsonResponse({ data: [{ name: "Category", slug: "category" }] }),
  });

  const categories = await client.categories.list();
  assert.deepEqual(categories, [{ name: "Category", slug: "category" }]);
});

test("authors.list parses wrapped data array", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () =>
      jsonResponse({
        data: [
          {
            id: "u1",
            name: "Author",
            about: "About",
            socialLinks: { x: "https://x.com/a" },
          },
        ],
      }),
  });

  const authors = await client.authors.list();
  assert.equal(authors[0].id, "u1");
  assert.equal(authors[0].socialLinks.x, "https://x.com/a");
});

test("stats.get parses stats payload", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () =>
      jsonResponse({
        totalPosts: 10,
        totalAuthors: 2,
        totalCategories: 3,
        totalTags: 4,
      }),
  });

  const stats = await client.stats.get();
  assert.equal(stats.totalPosts, 10);
  assert.equal(stats.totalTags, 4);
});

test("throws HiveApiError on non-2xx response", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () =>
      jsonResponse(
        {
          message: "Invalid API key",
          code: "INVALID_API_KEY",
          details: { hint: "rotate key" },
        },
        401,
      ),
  });

  await assert.rejects(
    () => client.stats.get(),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "INVALID_API_KEY");
      assert.deepEqual(error.details, { hint: "rotate key" });
      assert.match(error.message, /\[hive-cms\] request error/i);
      assert.match(error.message, /status\s*: 401/i);
      assert.match(error.message, /code\s*: INVALID_API_KEY/i);
      assert.match(error.message, /method\s*: GET/i);
      assert.match(error.message, /url\s*:/i);
      assert.match(error.message, /hint\s*:/i);
      return true;
    },
  );
});

test("throws HiveApiError when API payload marks success false", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () =>
      jsonResponse({ success: false, message: "Nope", code: "BAD_REQUEST" }),
  });

  await assert.rejects(
    () => client.stats.get(),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.code, "BAD_REQUEST");
      return true;
    },
  );
});

test("wraps network-level fetch failures as HiveApiError", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () => {
      throw new TypeError("fetch failed");
    },
  });

  await assert.rejects(
    () => client.stats.get(),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.status, 503);
      assert.equal(error.code, "NETWORK_ERROR");
      assert.match(error.message, /connectivity/i);
      return true;
    },
  );
});

test("wraps unknown runtime failures as HiveApiError", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () => ({}),
  });

  await assert.rejects(
    () => client.tags.list(),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.status, 500);
      assert.equal(error.code, "SDK_RUNTIME_ERROR");
      return true;
    },
  );
});

test("throws HiveApiError on invalid response shape", async () => {
  const client = new Hive({
    apiKey: "k",
    fetch: async () => jsonResponse({ data: "not-an-array" }),
  });

  await assert.rejects(
    () => client.tags.list(),
    (error) => {
      assert.ok(error instanceof HiveApiError);
      assert.equal(error.code, "INVALID_API_RESPONSE");
      assert.equal(error.status, 502);
      return true;
    },
  );
});
