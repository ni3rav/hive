export class QueryKeys {
  private static user = {
    base: ['user'] as const,

    me() {
      return [...this.base, 'me'];
    },

    profile(userId?: string) {
      return userId
        ? [...this.base, 'profile', userId]
        : [...this.base, 'profile'];
    },

    settings() {
      return [...this.base, 'settings'];
    },

    sessions() {
      return [...this.base, 'sessions'];
    },
  };

  private static authors = {
    base: ['authors'] as const,

    list(workspaceSlug: string) {
      return [...this.base, 'list', workspaceSlug];
    },

    author(authorId: string) {
      return [...this.base, 'detail', authorId];
    },

    search(workspaceSlug: string, query?: string) {
      return query
        ? [...this.base, 'search', workspaceSlug, query]
        : [...this.base, 'search', workspaceSlug];
    },
  };

  private static posts = {
    base: ['posts'] as const,

    all(workspaceSlug: string) {
      return [...this.base, 'all', workspaceSlug];
    },

    userPosts(workspaceSlug: string, userId?: string) {
      return userId
        ? [...this.base, 'user', workspaceSlug, userId]
        : [...this.base, 'user', workspaceSlug];
    },

    post(workspaceSlug: string, postId: string) {
      return [...this.base, 'detail', workspaceSlug, postId];
    },

    byAuthor(workspaceSlug: string, authorId: string) {
      return [...this.base, 'author', workspaceSlug, authorId];
    },

    byCategory(workspaceSlug: string, categorySlug: string) {
      return [...this.base, 'category', workspaceSlug, categorySlug];
    },

    byTag(workspaceSlug: string, tagId: string) {
      return [...this.base, 'tag', workspaceSlug, tagId];
    },

    drafts(workspaceSlug: string) {
      return [...this.base, 'drafts', workspaceSlug];
    },

    published(workspaceSlug: string) {
      return [...this.base, 'published', workspaceSlug];
    },

    search(workspaceSlug: string, query?: string) {
      return query
        ? [...this.base, 'search', workspaceSlug, query]
        : [...this.base, 'search', workspaceSlug];
    },
  };

  private static categories = {
    base: ['categories'] as const,

    list(workspaceSlug: string) {
      return [...this.base, 'list', workspaceSlug];
    },

    category(workspaceSlug: string, categorySlug: string) {
      return [...this.base, 'detail', workspaceSlug, categorySlug];
    },
  };

  private static tags = {
    base: ['tags'] as const,
    list(workspaceSlug: string) {
      return [...this.base, 'list', workspaceSlug];
    },

    tag(workspaceSlug: string, tagSlug: string) {
      return [...this.base, 'detail', workspaceSlug, tagSlug];
    },
  };

  private static workspace = {
    base: ['workspace'] as const,

    list() {
      return [...this.base, 'list'];
    },

    info() {
      return [...this.base, 'info'];
    },

    members(workspaceSlug: string) {
      return [...this.base, 'members', workspaceSlug];
    },

    workspace(workspaceSlug: string) {
      return [...this.base, workspaceSlug];
    },

    verify(workspaceSlug: string) {
      return [...this.base, 'verify', workspaceSlug];
    },

    settings() {
      return [...this.base, 'settings'];
    },

    dashboardStats(workspaceSlug: string) {
      return [...this.base, 'dashboard', workspaceSlug];
    },

    dashboardHeatmap(workspaceSlug: string) {
      return [...this.base, 'dashboard-heatmap', workspaceSlug];
    },
  };

  private static apiKeys = {
    base: ['apiKeys'] as const,

    list(workspaceSlug: string) {
      return [...this.base, 'list', workspaceSlug] as const;
    },
  };

  public static userKeys() {
    return this.user;
  }

  public static authorKeys() {
    return this.authors;
  }

  public static postKeys() {
    return this.posts;
  }

  public static categoryKeys() {
    return this.categories;
  }

  public static tagKeys() {
    return this.tags;
  }

  public static workspaceKeys() {
    return this.workspace;
  }

  public static apiKeyKeys() {
    return this.apiKeys;
  }

  public static allKeys() {
    return {
      user: this.user.base,
      authors: this.authors.base,
      posts: this.posts.base,
      categories: this.categories.base,
      tags: this.tags.base,
      workspace: this.workspace.base,
      apiKeys: this.apiKeys.base,
    };
  }
}
