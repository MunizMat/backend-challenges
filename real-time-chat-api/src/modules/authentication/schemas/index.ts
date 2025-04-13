/* ------------ External -------------- */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ message: 'Email is required' }),
  password: z.string({ message: 'Password is required' }),
});
