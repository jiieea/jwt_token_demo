import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import fs from 'fs';
import { join } from 'path';

export class CleanUpInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    return next.handle().pipe(
      catchError(async (err: Error) => {
        const filesToDelete: string[] = [];

        //   handle single file
        if (file) {
          (request.file.destination, request.file.fileName);
          filesToDelete.push(file);
        }

        if (Array.isArray(request.file)) {
          request.file.forEach((file) => {
            const filePath = join(
              process.cwd(),
              file.destination,
              file.filename,
            );
            filesToDelete.push(filePath);
          });
        }

        if (
          request.file &&
          typeof request.file === 'object' &&
          !Array.isArray(request.file)
        ) {
          Object.values(request.file).forEach((fileArray: any) => {
            fileArray.forEach((file) => {
              const filePath = join(
                process.cwd(),
                file.destination,
                file.filename,
              );
              filesToDelete.push(filePath);
            });
          });
        }

        await Promise.all(
          filesToDelete.map(async (file) => {
            try {
              if (fs.existsSync(file)) {
                await fs.promises.unlink(file);
              }
            } catch {
              console.error(`Cleanup Error: ${err}`);
            }
          }),
        );
      }),
    );
  }
}
