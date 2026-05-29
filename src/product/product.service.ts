import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProductValidation } from './product.validation';
import { ValidationService } from '../validation/validation.service';
import {
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
} from '../model/product.model';
import { Prisma } from '../generated/client';
import { replaceProductImage } from '../../uploads/upload.config';
import { WebModel } from '../model/web.model';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  toProductResponse = (product: ProductResponse) => {
    return {
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      quantity: product.quantity,
      product_image: product.product_image,
    };
  };

  async checkProductToBeExist(
    productId: number,
    username: string,
  ): Promise<ProductResponse> {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
        username: username,
      },
    });

    if (!product) {
      throw new HttpException(
        `No Product with id ${productId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  async addProduct(
    user: string,
    request: ProductRequest,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    try {
      const productRequest = this.validationService.validation(
        ProductValidation.ADD_PRODUCT,
        request,
      );

      if (file) {
        productRequest.product_image = file.filename;
      }

      const newProduct = await this.prismaService.product.create({
        data: {
          ...productRequest,
          ...{ username: user },
        },
      });
      return this.toProductResponse(newProduct);
    } catch (err) {
      throw err;
    }
  }

  async updateProduct(
    username: string,
    request: ProductUpdateRequest,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    this.logger.info(`User ${username} update product`);
    const productUpdate = this.validationService.validation(
      ProductValidation.UPDATE,
      request,
    );
    const existingProduct: any = await this.prismaService.product.findUnique({
      where: { id: productUpdate.id, username: username },
    });

    if (!existingProduct)
      throw new HttpException(
        `product not found with id ${productUpdate.id}`,
        HttpStatus.NOT_FOUND,
      );

    const updateData: Prisma.productUpdateInput = {
      ...(productUpdate.product_name && {
        product_name: productUpdate.product_name,
      }),
      ...(productUpdate.price && { price: productUpdate.price }),
      ...(productUpdate.quantity && { quantity: productUpdate.quantity }),
    };

    if (file) {
      replaceProductImage(existingProduct.product_image);
      updateData.product_image = file.filename;
    }
    this.logger.info(`Updating product ${existingProduct.id}`);

    return this.prismaService.product.update({
      where: { id: productUpdate.id, username },
      data: updateData,
    });
  }

  async getProducts(
    page: number,
    size: number,
  ): Promise<WebModel<ProductResponse[]>> {
    const skip = (page - 1) * size;
    const products = await this.prismaService.product.findMany({
      skip: skip,
      take: size,
      select: {
        id: true,
        product_name: true,
        price: true,
        quantity: true,
        product_image: true,
      },
    });

    const total = await this.prismaService.product.count();

    return {
      data: products.map((product) => this.toProductResponse(product)),
      paging: {
        pages: page,
        total_page: Math.ceil(total / size),
        total_item: total,
      },
    };
  }
}
