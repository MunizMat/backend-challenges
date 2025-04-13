/* --------------- External -------------- */
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcrypt';

/* --------------- Clients -------------- */
import { cassandraClient } from '@/clients/cassandra';

/* --------------- Types -------------- */
import { User } from '@/modules/users';
import { RequestHandler } from '@/types';

/* --------------- Schemas -------------- */
import { createUserSchema } from '@/modules/users/schemas';

/* --------------- Utils -------------- */
import { ApiError } from '@/utils/ApiError';
import { json } from '@/utils/json';
import { logger } from '@/utils/logger';

export const registerPOSTHandler: RequestHandler = async (
  request,
  response,
) => {
  try {
    const {
      email,
      name,
      password: rawPassword,
    } = createUserSchema.parse(request.body);

    const { rows } = await cassandraClient.execute(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (rows.length > 0) throw new ApiError(400, 'This email is in use');

    const hashedPassword = await hash(rawPassword, 12);
    const now = new Date();

    const user: User.Model = {
      id: uuidV4(),
      email,
      name,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      status: 'online',
    };

    const columns = Object.keys(user);
    const valuesPlaceholders = Array.from(
      {
        length: columns.length,
      },
      () => '?',
    );
    const query = `INSERT INTO users (${columns.join(
      ', ',
    )}) VALUES (${valuesPlaceholders.join(', ')});`;
    console.log(query);

    await cassandraClient.execute(query, user);

    const { password, ...userToReturn } = user;

    response.write(json({ user: userToReturn }));
  } catch (e) {
    logger.error(e);
    throw ApiError.fromError(e);
  }
};
