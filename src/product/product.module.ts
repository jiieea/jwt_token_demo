import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, ValidationService],
})
export class ProductModule {}
