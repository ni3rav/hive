import { workspacesTable, workspaceUsersTable } from '../db/schema/workspace';

export type Workspace = typeof workspacesTable.$inferSelect;
export type WorkspaceUser = typeof workspaceUsersTable.$inferSelect;

export type UserWorkspace = Workspace &
  Pick<WorkspaceUser, 'role' | 'joinedAt'>;
