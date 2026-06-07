import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../guard/auth.guard';
import { CartRequest } from '../model/cart.model';
import * as client from '../generated/client';
import { User } from '../auth/decorators/auth.decorator';

@Controller('/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('/add')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async addProduct(@Body() request: CartRequest, @User() user: client.USER) {
    return await this.cartService.addToCart(request, user.username);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getProduct(@User() user: client.USER) {
    return this.cartService.getCarts(user.username);
  }

  @Patch('/update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: CartRequest,
    @User() user: client.USER,
  ) {
    const update = await this.cartService.updateCart(
      id,
      request,
      user.username,
    );
    return {
      data: update,
      message: 'Update Cart Success',
    };
  }
}
