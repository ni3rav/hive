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

    author(authorId: string) {
      return [...this.base, authorId];
    },

    search(query?: string) {
      return query ? [...this.base, 'search', query] : [...this.base, 'search'];
    },
  };

  private static posts = {
    base: ['posts'] as const,

    all() {
      return [...this.base, 'all'];
    },

    userPosts(userId?: string) {
      return userId ? [...this.base, 'user', userId] : [...this.base, 'user'];
    },

    post(postId: string) {
      return [...this.base, postId];
    },

    byAuthor(authorId: string) {
      return [...this.base, 'author', authorId];
    },

    byCategory(categoryId: string) {
      return [...this.base, 'category', categoryId];
    },

    byTag(tagId: string) {
      return [...this.base, 'tag', tagId];
    },

    drafts() {
      return [...this.base, 'drafts'];
    },

    published() {
      return [...this.base, 'published'];
    },

    search(query?: string) {
      return query ? [...this.base, 'search', query] : [...this.base, 'search'];
    },
  };

  private static categories = {
    base: ['categories'] as const,

    all() {
      return [...this.base, 'all'];
    },

    category(categorySlug: string) {
      return [...this.base, categorySlug];
    },
  };

  private static tags = {
    base: ['tags'] as const,

    all() {
      return [...this.base, 'all'];
    },

    tag(tagSlug: string) {
      return [...this.base, tagSlug];
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

    members() {
      return [...this.base, 'members'];
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

  public static allKeys() {
    return {
      user: this.user.base,
      authors: this.authors.base,
      posts: this.posts.base,
      categories: this.categories.base,
      tags: this.tags.base,
      workspace: this.workspace.base,
    };
  }
}
