import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';
import multer from 'multer';

@Catch(ZodError, HttpException)
export class UserFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const typeResponse = exception.getResponse();
      const errMsg =
        typeof typeResponse === 'object'
          ? (typeResponse as any).message
          : typeResponse;
      response.status(status).json({
        errors: errMsg,
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: exception.issues,
      });
    } else if (exception instanceof multer.MulterError) {
      response.status(413).json({
        errors: exception.message,
      });
    } else {
      response.status(500).json({
        errors: 'Internal Server Error',
      });
    }
  }
}
