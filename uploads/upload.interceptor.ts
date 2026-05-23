import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import fs from 'fs';
import { join } from 'path';

@Injectable()
export class CleanUpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError(async (err) => {
        if (request.file) {
          const filePath = join(
            process.cwd(),
            request.file.destination,
            request.file.filename,
          );

          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }

        throw err;
      }),
    );
  }
}
