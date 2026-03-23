import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, ValidationService],
})
export class UserModule {}
