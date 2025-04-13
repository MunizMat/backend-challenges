/* --------------- External -------------- */
import { compare } from 'bcrypt';

/* --------------- Clients -------------- */
import { sign } from 'jsonwebtoken';

/* --------------- Types -------------- */
import { RequestHandler } from '@/types';

/* --------------- Schemas -------------- */
import { loginSchema } from '@/modules/authentication/schemas';

/* --------------- Repositories -------------- */
import { userRepository } from '@/modules/users/repository';

/* --------------- Utils -------------- */
import { ApiError } from '@/utils/ApiError';
import { json } from '@/utils/json';
import { logger } from '@/utils/logger';

export const loginPOSTHandler: RequestHandler = async (request, response) => {
  try {
    const { email, password: rawPassword } = loginSchema.parse(request.body);

    const user = await userRepository.findByEmail(email);

    if (!user) throw new ApiError(400, 'Invalid credentials');

    const isValid = await compare(rawPassword, user.password);

    if (!isValid) throw new ApiError(400, 'Invalid credentials');

    const token = sign(
      { email: user.email, id: user.id, status: user.status },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      },
    );

    response.write(json({ token }));
  } catch (e) {
    logger.error(e);
    throw ApiError.fromError(e);
  }
};
