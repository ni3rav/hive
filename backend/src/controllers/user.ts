import { Request, Response } from 'express';
import { editProfileSchema } from '../utils/validations/user';
import { usersTable } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { getUserIdbySession } from '../utils/sessions';
import {
  validationError,
  notFound,
  conflict,
  ok,
  serverError,
} from '../utils/responses';

export async function editProfileController(req: Request, res: Response) {
  const validatedBody = editProfileSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { name, email } = validatedBody.data;
  const sessionId: string = req.cookies['session_id'];

  const [, userId] = await getUserIdbySession(sessionId);

  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId!),
    });

    if (!user) {
      return notFound(res, 'User not found');
    }

    // if email is being updated, check if it's already taken by another user
    if (email !== undefined && email !== user.email) {
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });
      if (existingUser && existingUser.id !== user.id) {
        return conflict(res, 'Email already in use');
      }
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    return ok(res, 'Profile updated successfully', {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return serverError(res, 'Failed to update profile');
  }
}
