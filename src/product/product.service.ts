import { PrismaService } from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProductValidation } from './product.validation';
import { ValidationService } from '../validation/validation.service';
import { ProductRequest, ProductResponse } from '../model/product.model';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async addProduct(
    user: string,
    request: ProductRequest,
  ): Promise<ProductResponse> {
    console.log(`User ${user} creating new product`);
    const productRequest = this.validationService.validation(
      ProductValidation.ADD_PRODUCT,
      request,
    );

    return this.prismaService.product.create({
      data: {
        ...productRequest,
        ...{ username: user },
      },
    });
  }
}
