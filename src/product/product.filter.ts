import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class ProductFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const typeResponse = exception.getResponse();
      const errorMessage =
        typeof typeResponse === 'object'
          ? (typeResponse as any).message
          : typeResponse;

      response.status(status).json({
        errors: errorMessage,
      });
    } else if (this.isZodError(exception)) {
      response.status(400).json({
        errors: (exception as ZodError).issues.map((issue) => issue.message), // ✅ message only
      });
    } else {
      response.status(500).json({
        errors: 'Internal Server Error',
      });
    }
  }

  private isZodError(exception: unknown): exception is ZodError {
    return (
      exception instanceof ZodError || (exception as any)?.name === 'ZodError'
    );
  }
}
