import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class ProductFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost): any {
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
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: exception.message,
      });
    } else {
      response.status(500).json({
        errors: 'Internal Server Error',
      });
    }
  }
}
