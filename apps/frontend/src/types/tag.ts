export interface Tag {
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface CreateTagData {
  name: string;
  slug: string;
}
