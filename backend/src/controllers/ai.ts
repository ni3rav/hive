import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userAiSettingsTable } from '../db/schema';
import logger from '../logger';
import { generateGeminiText } from '../utils/ai/gemini';
import { decrypt, encrypt } from '../utils/encryption';
import {
  analyzePostSchema,
  saveAiProviderSchema,
  transformSelectionSchema,
} from '../utils/validations/ai';
import {
  badRequest,
  forbidden,
  ok,
  serverError,
  unauthorized,
  validationError,
} from '../utils/responses';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

function getToneInstruction(tone?: string): string {
  if (!tone) {
    return 'Adjust the tone to be clear and professional.';
  }

  return `Rewrite the text to use a ${tone} tone while preserving intent.`;
}

function getTransformInstruction(
  action: 'change_tone' | 'fix_grammar' | 'elaborate' | 'concise',
  tone?: string,
): string {
  switch (action) {
    case 'change_tone':
      return `${getToneInstruction(tone)}
Return only the rewritten text.`;
    case 'fix_grammar':
      return `Fix grammar, spelling, punctuation, and readability while preserving the original meaning and voice.
Return only the corrected text.`;
    case 'elaborate':
      return `Expand the text with useful detail and clarity while preserving core meaning.
Return only the rewritten text.`;
    case 'concise':
      return `Make the text concise while preserving core meaning and key facts.
Return only the rewritten text.`;
    default:
      return `Fix grammar, spelling, punctuation, and readability while preserving the original meaning and voice.
Return only the corrected text.`;
  }
}

async function getUserAiSettings(userId: string) {
  return db.query.userAiSettingsTable.findFirst({
    where: eq(userAiSettingsTable.userId, userId),
  });
}

function getAuthenticatedUserId(req: Request, res: Response): string | null {
  if (!req.userId) {
    unauthorized(res, 'Unauthorized');
    return null;
  }

  return req.userId;
}

export async function getAiProviderController(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const settings = await getUserAiSettings(userId);

    return ok(res, 'AI provider settings retrieved', {
      provider: 'gemini',
      hasKey: Boolean(settings?.encryptedApiKey),
      model: settings?.model ?? DEFAULT_GEMINI_MODEL,
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch AI provider settings');
    return serverError(res, 'Failed to fetch AI provider settings');
  }
}

export async function saveAiProviderController(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const validatedBody = saveAiProviderSchema.safeParse(req.body);
  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const model = validatedBody.data.model ?? DEFAULT_GEMINI_MODEL;

  try {
    const encryptedApiKey = encrypt(validatedBody.data.apiKey);

    await db
      .insert(userAiSettingsTable)
      .values({
        userId,
        provider: 'gemini',
        encryptedApiKey,
        model,
      })
      .onConflictDoUpdate({
        target: userAiSettingsTable.userId,
        set: {
          provider: 'gemini',
          encryptedApiKey,
          model,
          updatedAt: new Date(),
        },
      });

    return ok(res, 'AI provider settings saved', {
      provider: 'gemini',
      hasKey: true,
      model,
    });
  } catch (error) {
    logger.error(error, 'Failed to save AI provider settings');
    return serverError(res, 'Failed to save AI provider settings');
  }
}

export async function deleteAiProviderController(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    await db
      .delete(userAiSettingsTable)
      .where(eq(userAiSettingsTable.userId, userId));

    return ok(res, 'AI provider settings removed');
  } catch (error) {
    logger.error(error, 'Failed to delete AI provider settings');
    return serverError(res, 'Failed to delete AI provider settings');
  }
}

export async function analyzePostController(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const validatedBody = analyzePostSchema.safeParse(req.body);
  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  try {
    const settings = await getUserAiSettings(userId);
    if (!settings) {
      return forbidden(res, 'AI key not configured', { reason: 'AI_KEY_MISSING' });
    }

    const apiKey = decrypt(settings.encryptedApiKey);
    const prompt = `Post content:
${validatedBody.data.content}

Additional user focus:
${validatedBody.data.userPrompt ?? 'No additional focus provided.'}`;

    const analysis = await generateGeminiText({
      apiKey,
      model: settings.model,
      systemInstruction: `You are an editorial assistant.
Return concise markdown only.

Response format (exactly these sections):
## Summary
- one bullet

## Strengths
- 1 to 2 bullets

## Improvements
- 1 to 3 bullets

Rules:
- Keep total length under 250 words.
- Keep bullets short and actionable.
- Use layman's terms and avoid technical jargon.
- Use simple language and avoid complex sentences.
- No preamble, no code blocks, no extra sections.`,
      prompt,
    });

    return ok(res, 'Post analyzed successfully', { analysis });
  } catch (error) {
    logger.error(error, 'Failed to analyze post with Gemini');
    return serverError(res, 'Failed to analyze post');
  }
}

export async function transformSelectionController(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const validatedBody = transformSelectionSchema.safeParse(req.body);
  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  switch (validatedBody.data.action) {
    case 'change_tone':
      if (!validatedBody.data.tone) {
        return badRequest(res, 'Tone is required for change_tone action');
      }
      break;
    case 'fix_grammar':
    case 'elaborate':
    case 'concise':
      break;
    default:
      return badRequest(res, 'Invalid transform action');
  }

  try {
    const settings = await getUserAiSettings(userId);
    if (!settings) {
      return forbidden(res, 'AI key not configured', {
        reason: 'AI_KEY_MISSING',
      });
    }

    const apiKey = decrypt(settings.encryptedApiKey);
    const instruction = getTransformInstruction(
      validatedBody.data.action,
      validatedBody.data.tone,
    );

    const transformed = await generateGeminiText({
      apiKey,
      model: settings.model,
      systemInstruction: instruction,
      prompt: `Text to transform:
${validatedBody.data.selection}`,
    });

    return ok(res, 'Selection transformed successfully', { transformed });
  } catch (error) {
    logger.error(error, 'Failed to transform selection with Gemini');
    return serverError(res, 'Failed to transform selection');
  }
}
