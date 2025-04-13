/* --------------- External --------------- */
import { ZodError } from 'zod';

/* --------------- Utils --------------- */
import { json } from '@/utils/json';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.status = status;
  }

  toJSON() {
    return json({
      message: this.message,
      status: this.status,
    });
  }

  static fromError(error: unknown) {
    if (error instanceof ApiError) return error;

    if (error instanceof ZodError) {
      const [issue] = error.issues;

      return new ApiError(400, issue.message);
    }

    return new ApiError(500, 'Internal server error');
  }
}
