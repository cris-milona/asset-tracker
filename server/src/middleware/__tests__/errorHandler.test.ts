import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { Response } from 'express';
import { errorHandler, HttpError } from '../errorHandler.js';

const mockResponse = (): Response => {
  const response = {} as Response;
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  return response;
};

describe('errorHandler', () => {
  it('maps a ZodError to 400 with field-level details', () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: '' });
    if (result.success) throw new Error('expected validation to fail');
    const response = mockResponse();

    errorHandler(result.error, {} as never, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        details: { name: [expect.any(String)] },
      },
    });
  });

  it('maps an HttpError to its own status code and message', () => {
    const response = mockResponse();

    errorHandler(new HttpError(404, 'Asset not found', 'NOT_FOUND'), {} as never, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: { message: 'Asset not found', code: 'NOT_FOUND' },
    });
  });

  it('falls back to a generic 500 for anything else', () => {
    const response = mockResponse();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(new Error('boom'), {} as never, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });
  });
});
