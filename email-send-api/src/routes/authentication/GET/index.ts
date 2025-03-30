/* ------------ External -------------- */
import { sign } from 'jsonwebtoken';

/* ------------ Types -------------- */
import { RequestHandler, User } from "@/types";

/* ------------ Utils -------------- */
import { ApiError } from "@/utils/ApiError";
import { hash } from "@/utils/hash";
import { json } from '@/utils/json';
import { logger } from '@/utils/logger';

/* ------------ Clients -------------- */
import { mongo } from '@/clients/mongodb';


export const authenticationGETHandler: RequestHandler = async (request, response) => {
  try {
    const authenticationHeader = request.headers.authorization;

    if (!authenticationHeader || !authenticationHeader.startsWith('Basic '))
      throw new ApiError(400, 'Malformed authorization header');

    const [, encodedCredentials] = authenticationHeader?.split(' ');

    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');

    const [email, password] = decodedCredentials.split(':');

    const user = await mongo.db(process.env.MONGO_DB_NAME).collection<User>('users').findOne({ email });

    if (!user)
      throw new ApiError(400, 'Invalid credentials');

    const hashedPassword = hash(password, user.salt);

    if (hashedPassword !== user.password)
      throw new ApiError(400, 'Invalid credentials');

    const token = sign({ email: user.email }, process.env.JWT_SECRET || '', {
      expiresIn: '1h',
    });

    response.write(json({ token }));
  } catch (e) {
    logger.error(e);

    throw ApiError.fromError(e);
  }
}