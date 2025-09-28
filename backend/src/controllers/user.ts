import { Request, Response } from 'express';
import { editProfileSchema } from '../utils/validations/user';
import { sessionsTable, usersTable } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export async function editProfileController(req: Request, res: Response) {
  const validatedBody = editProfileSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return res.status(400).json({
      message: 'Invalid Payload',
    });
  }

  const { name, email } = validatedBody.data;
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    return res
      .status(401)
      .json({ message: 'No sessionId found. Please log in.' });
  }

  try {
    const session = await db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.id, sessionId),
    });

    if (!session) {
      return res.status(401).json({ message: 'Session not found or expired.' });
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.userId),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // if email is being updated, check if it's already taken by another user
    if (email !== undefined && email !== user.email) {
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: 'email already in use' });
      }
    }

    await db
      .update(usersTable)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
      })
      .where(eq(usersTable.id, user.id));

    return res.status(200).json({ message: 'User edited successfully.' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
