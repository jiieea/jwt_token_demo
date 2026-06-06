import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../guard/auth.guard';
import { AddToCartRequest } from '../model/cart.model';
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
  async addProduct(
    @Body() request: AddToCartRequest,
    @User() user: client.USER,
  ) {
    return await this.cartService.addToCart(request, user.username);
  }
}
