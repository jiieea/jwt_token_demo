import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
@Module({
  providers: [CartService, PrismaService, ValidationService],
  controllers: [CartController],
})
export class CartModule {}
