import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';
import { TransformInterceptor } from './transform.interceptor.js';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  const createMockContext = (statusCode = 200): ExecutionContext => {
    const mockResponse = { statusCode };
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
      getHandler: () => () => {},
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (data: any): CallHandler => ({
    handle: () => of(data),
  });

  it('should transform response to { statusCode, message: "success", data } by default', async () => {
    const context = createMockContext(200);
    const handler = createMockCallHandler({ id: 1, name: 'Alice' });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toEqual({
      statusCode: 200,
      message: 'success',
      data: { id: 1, name: 'Alice' },
    });
  });

  it('should use custom message when set via @ResponseMessage decorator metadata', async () => {
    const context = createMockContext(201);
    const handler = createMockCallHandler({ id: 2, name: 'Bob' });

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === RESPONSE_MESSAGE_KEY) {
        return 'User created successfully';
      }
      return undefined;
    });

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toEqual({
      statusCode: 201,
      message: 'User created successfully',
      data: { id: 2, name: 'Bob' },
    });
  });

  it('should format null/undefined data as null', async () => {
    const context = createMockContext(200);
    const handler = createMockCallHandler(undefined);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toEqual({
      statusCode: 200,
      message: 'success',
      data: null,
    });
  });
});
