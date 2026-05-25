import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProductRequest, ProductResponse } from '../model/product.model';
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
}
