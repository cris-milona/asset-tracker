import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten().fieldErrors,
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: { message: error.message, code: error.code },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
};
