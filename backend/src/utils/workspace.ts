import { db } from '../db';
import { UserWorkspace } from '../types/workspaces';

export async function getUserWorkspaces(
  userId: string,
): Promise<[Error, null] | [null, UserWorkspace[]]> {
  try {
    const query = await db.query.workspaceUsersTable.findMany({
      where: (workspaceUsers, { eq }) => eq(workspaceUsers.userId, userId),
      with: {
        workspace: true,
      },
    });
    const userWorkspaces = query.map((item) => {
      return { ...item.workspace, role: item.role, joinedAt: item.joinedAt };
    });
    return [null, userWorkspaces];
  } catch (error) {
    console.error('Error in getUserWorkspace util', error);
    return [new Error('ERROR WHILE GETTING USER WORKSPACE'), null];
  }
}
