/* ------------ External -------------- */
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { MongoError } from "mongodb";

/* ------------ Types -------------- */
import { RequestHandler, User } from "@/types";

/* ------------ Utils -------------- */
import { ApiError } from "@/utils/ApiError";
import { hash } from "@/utils/hash";
import { logger } from "@/utils/logger";
import { measureOperationTime } from "@/utils/measureOperationTime";

/* ------------ Clients -------------- */
import { mongo } from '@/clients/mongodb';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export const authenticationPOSTHandler: RequestHandler = async (request) => {
  try {
    const { email, password } = signUpSchema.parse(request.body);

    logger.info('Sign Up Request Received', { email });

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = hash(password, salt);

    const now = new Date();

    const user: User = {
      email,
      password: hashedPassword,
      salt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    await measureOperationTime(() => mongo.db(process.env.MONGO_DB_NAME).collection('users').insertOne(user), 'Saved user');
  } catch (e) {
    logger.error(e);

    if (e instanceof MongoError && e.code === 11000)
      throw new ApiError(500, 'Unable to process your request. Please try again.');

    throw ApiError.fromError(e);
  }
}