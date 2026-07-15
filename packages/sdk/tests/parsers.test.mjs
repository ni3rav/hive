import test from "node:test";
import assert from "node:assert/strict";

import { Hive, HiveApiError } from "../dist/index.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const parserCases = [
  {
    name: "posts.list rejects non-numeric total",
    run: (client) => client.posts.list(),
    payload: {
      data: [
        {
          title: "t",
          slug: "s",
          excerpt: "e",
          publishedAt: null,
          updatedAt: null,
          category: null,
          tags: [],
          author: null,
        },
      ],
      total: "1",
      offset: 0,
      limit: 10,
    },
  },
  {
    name: "posts.get rejects missing htmlContent",
    run: (client) => client.posts.get("slug"),
    payload: {
      title: "t",
      slug: "s",
      excerpt: "e",
      publishedAt: null,
      updatedAt: null,
      category: null,
      tags: [],
      author: null,
    },
  },
  {
    name: "tags.list rejects malformed tag item",
    run: (client) => client.tags.list(),
    payload: {
      data: [{ name: "Tag", slug: 123 }],
    },
  },
  {
    name: "categories.list rejects malformed category item",
    run: (client) => client.categories.list(),
    payload: {
      data: [{ name: 42, slug: "cat" }],
    },
  },
  {
    name: "authors.list rejects non-object socialLinks",
    run: (client) => client.authors.list(),
    payload: {
      data: [
        {
          id: "a1",
          name: "Author",
          about: "About",
          socialLinks: "x.com/a",
        },
      ],
    },
  },
  {
    name: "stats.get rejects non-numeric stats",
    run: (client) => client.stats.get(),
    payload: {
      totalPosts: "10",
      totalAuthors: 2,
      totalCategories: 3,
      totalTags: 4,
    },
  },
];

for (const c of parserCases) {
  test(c.name, async () => {
    const client = new Hive({
      apiKey: "k",
      fetch: async () => jsonResponse(c.payload),
    });

    await assert.rejects(
      () => c.run(client),
      (error) => {
        assert.ok(error instanceof HiveApiError);
        assert.equal(error.code, "INVALID_API_RESPONSE");
        assert.equal(error.status, 502);
        return true;
      },
    );
  });
}
