import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ValidationService } from '../validation/validation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AuthService, ValidationService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
