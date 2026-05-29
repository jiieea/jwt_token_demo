import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ProductFilter } from './product.filter';
@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ProductFilter,
    },
  ],
})
export class ProductModule {}
