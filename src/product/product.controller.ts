import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  ProductUpdateResponse,
} from '../model/product.model';
import { User } from '../auth/decorators/auth.decorator';
import { WebModel } from '../model/web.model';
import { ROLE } from '../generated/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter, productStorage } from '../../uploads/upload.config';
import { CleanUpInterceptor } from '../../uploads/upload.interceptor';

@Controller('/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Post('/create')
  @HttpCode(201)
  @Roles(ROLE.ADMIN)
  @UseInterceptors(
    FileInterceptor('product', {
      storage: productStorage,
      fileFilter: imageFilter,
      limits: {
        fileSize: 1024 * 1024 * 2,
      },
    }),
    CleanUpInterceptor,
  )
  async postProduct(
    @Body() body: ProductRequest,
    @User('username') username: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebModel<ProductResponse>> {
    const newProduct = await this.productService.addProduct(
      username,
      body,
      file,
    );
    return {
      data: newProduct,
      message: 'Create Product Success',
    };
  }

  @Patch('/update/:productId')
  @HttpCode(201)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @UseInterceptors(
    FileInterceptor('product', {
      storage: productStorage,
      fileFilter: imageFilter,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
    }),
    CleanUpInterceptor,
  )
  async updateProduct(
    @User('username') username: string,
    @Body() body: ProductUpdateRequest,
    @UploadedFile() file: Express.Multer.File,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<WebModel<ProductUpdateResponse>> {
    body.id = productId;
    const updateProduct = await this.productService.updateProduct(
      username,
      body,
      file,
    );

    return {
      data: updateProduct,
      message: 'Update Product Success',
    };
  }

  @Get('/products')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async getProducts(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
  ) {
    return this.productService.getProducts(page, size);
  }
}
