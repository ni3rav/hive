import { sql, eq, and } from 'drizzle-orm';
import { db } from '../db';
import { workspaceApiKeysTable } from '../db/schema';
import logger from '../logger';
import {
  generateWorkspaceApiKey,
  hashWorkspaceApiKey,
} from './api-key';

const MAX_KEYS_PER_WORKSPACE = 3;

type WorkspaceApiKey = typeof workspaceApiKeysTable.$inferSelect;

export type WorkspaceApiKeyMetadata = Omit<WorkspaceApiKey, 'hashedKey'>;

export async function listWorkspaceApiKeys(
  workspaceId: string,
): Promise<[Error, null] | [null, WorkspaceApiKeyMetadata[]]> {
  try {
    const keys = await db.query.workspaceApiKeysTable.findMany({
      where: eq(workspaceApiKeysTable.workspaceId, workspaceId),
      columns: {
        id: true,
        workspaceId: true,
        description: true,
        createdByUserId: true,
        createdAt: true,
        lastUsedAt: true,
        lastUsedIp: true,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    return [null, keys];
  } catch (error) {
    logger.error(error, 'Error listing workspace API keys');
    return [error as Error, null];
  }
}

export async function createWorkspaceApiKey({
  workspaceId,
  workspaceSlug,
  description,
  createdByUserId,
}: {
  workspaceId: string;
  workspaceSlug: string;
  description: string;
  createdByUserId: string;
}): Promise<
  [Error, null] | [null, { apiKey: string; metadata: WorkspaceApiKeyMetadata }]
> {
  try {
    const apiKey = generateWorkspaceApiKey(workspaceSlug);
    const hashedKey = hashWorkspaceApiKey(apiKey);
    const createdAt = new Date();

    const metadata = await db.transaction(async (tx) => {
      const [{ count }] = await tx
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(workspaceApiKeysTable)
        .where(eq(workspaceApiKeysTable.workspaceId, workspaceId));

      if (count >= MAX_KEYS_PER_WORKSPACE) {
        throw new Error('workspace already has maximum number of API keys');
      }

      const [record] = await tx
        .insert(workspaceApiKeysTable)
        .values({
          workspaceId,
          description,
          hashedKey,
          createdByUserId,
          createdAt,
        })
        .returning({
          id: workspaceApiKeysTable.id,
          workspaceId: workspaceApiKeysTable.workspaceId,
          description: workspaceApiKeysTable.description,
          createdByUserId: workspaceApiKeysTable.createdByUserId,
          createdAt: workspaceApiKeysTable.createdAt,
          lastUsedAt: workspaceApiKeysTable.lastUsedAt,
          lastUsedIp: workspaceApiKeysTable.lastUsedIp,
        });

      return record;
    });

    return [null, { apiKey, metadata }];
  } catch (error) {
    logger.error(error, 'Error creating workspace API key');
    return [error as Error, null];
  }
}

export async function deleteWorkspaceApiKey({
  workspaceId,
  apiKeyId,
}: {
  workspaceId: string;
  apiKeyId: string;
}): Promise<[Error, null] | [null, true]> {
  try {
    const result = await db
      .delete(workspaceApiKeysTable)
      .where(
        and(
          eq(workspaceApiKeysTable.id, apiKeyId),
          eq(workspaceApiKeysTable.workspaceId, workspaceId),
        ),
      );

    if (result.rowCount === 0) {
      return [new Error('api key not found'), null];
    }

    return [null, true];
  } catch (error) {
    logger.error(error, 'Error deleting workspace API key');
    return [error as Error, null];
  }
}

