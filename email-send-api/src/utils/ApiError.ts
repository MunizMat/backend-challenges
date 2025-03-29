import { ZodError } from "zod";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);

    this.status = status;
  }

  toJSON() {
    return JSON.stringify({
      message: this.message,
      status: this.status
    }, null, 2);
  }

  static fromError(error: unknown) {
    if (error instanceof ZodError) {
      const [issue] = error.issues;

      return new ApiError(400, issue.message);
    }

    return new ApiError(500, 'Internal server error');
  }
}