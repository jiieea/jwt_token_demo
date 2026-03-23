import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {
    const adapter = new PrismaMariaDb({
      database: process.env.DATABASE_URL,
    });
    super({
      adapter,
    });
  }
  onModuleInit() {
    this.logger.info('[PrismaService] Initializing Prisma Service');
  }
}
