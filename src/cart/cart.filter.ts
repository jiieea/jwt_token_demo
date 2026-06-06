import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class CartFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
