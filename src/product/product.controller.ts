import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
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
@Controller('/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Post('/create')
  @Roles(ROLE.ADMIN)
  async postProduct(
    @Body() body: ProductRequest,
    @User('username') username: string,
  ): Promise<WebModel<ProductResponse>> {
    console.log(username);
    const newProduct = await this.productService.addProduct(username, body);
    return {
      data: newProduct,
    };
  }
}
