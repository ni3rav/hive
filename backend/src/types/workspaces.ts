import { workspacesTable, workspaceUsersTable } from '../db/schema/workspace';
import { workspaceInvitationsTable } from '../db/schema/workspace-invitation';

export type Workspace = typeof workspacesTable.$inferSelect;
export type WorkspaceUser = typeof workspaceUsersTable.$inferSelect;
export type WorkspaceInvitation = typeof workspaceInvitationsTable.$inferSelect;

export type UserWorkspace = Workspace &
  Pick<WorkspaceUser, 'role' | 'joinedAt'>;
