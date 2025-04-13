/* ------------- External --------------- */
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(2, 'Name is too short')
    .max(40, 'Name is too long'),
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z.string({ message: 'Password is required' }),
});
