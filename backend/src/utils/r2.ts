import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../env';
import logger from '../logger';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export async function generatePresignedUploadUrl(
  options: PresignedUrlOptions,
): Promise<[null, string] | [Error, false]> {
  try {
    const { key, contentType, expiresIn = 300 } = options;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return [null, url];
  } catch (error) {
    logger.error(error, 'Error generating pre-signed URL');
    return [error as Error, false];
  }
}

export function getR2PublicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`;
}

export async function verifyR2ObjectExists(
  key: string,
): Promise<[null, true] | [Error, false]> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return [null, true];
  } catch (error) {
    logger.error(error, 'Error verifying R2 object exists');
    return [error as Error, false];
  }
}

export async function deleteR2Object(
  key: string,
): Promise<[null, true] | [Error, false]> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return [null, true];
  } catch (error) {
    logger.error(error, 'Error deleting R2 object');
    return [error as Error, false];
  }
}
