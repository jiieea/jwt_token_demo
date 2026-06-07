import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import {
  CartRequest,
  CartItemResponse,
  SummaryCartResponse,
} from '../model/cart.model';
import { WebModel } from '../model/web.model';
import { CartValidation } from './cart.validation';

const CART_SELECT = {
  id: true,
  quantity: true,
  product: {
    select: {
      id: true,
      product_name: true,
      price: true,
      quantity: true,
      product_image: true,
    },
  },
};

@Injectable()
export class CartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  // cart response
  private toCartResponse(row: {
    id: number;
    quantity: number;
    product: {
      id: number;
      product_name: string;
      price: number;
      product_image: string | null;
    };
  }): CartItemResponse {
    return {
      id: row.id,
      product_name: row.product.product_name,
      price: row.product.price,
      quantity: row.quantity,
      product_id: row.product.id,
      product_image: row.product.product_image,
      subtotal: row.quantity * row.product.price,
    };
  }

  private async findCartOrThrow(cartItemId: number, username: string) {
    const cart = await this.prismaService.cART.findFirst({
      where: { id: cartItemId, username },
      select: CART_SELECT,
    });

    if (!cart) {
      throw new HttpException(
        `Cart with id ${cartItemId} is not found `,
        HttpStatus.NOT_FOUND,
      );
    }
    return cart;
  }

  private async findProductOrThrow(productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpException(`Product not found`, HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async addToCart(
    request: CartRequest,
    username: string,
  ): Promise<WebModel<CartItemResponse>> {
    const productRequest = this.validationService.validation(
      CartValidation.ADD,
      request,
    );
    await this.findProductOrThrow(productRequest.product_id);
    const existing = await this.prismaService.cART.findFirst({
      where: { username, product_id: productRequest.product_id },
      select: CART_SELECT,
    });
    let cartRow: Awaited<ReturnType<typeof this.findCartOrThrow>>;
    if (existing) {
      //   update quantity
      this.logger.info(`username re-added product`);
      cartRow = await this.prismaService.cART.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: productRequest.quantity },
        },
        select: CART_SELECT,
      });
    } else {
      cartRow = await this.prismaService.cART.create({
        data: {
          username,
          product_id: productRequest.product_id,
          quantity: productRequest.quantity,
        },
        select: CART_SELECT,
      });
    }
    return {
      data: this.toCartResponse(cartRow),
    };
  }

  async getCarts(username: string): Promise<SummaryCartResponse> {
    const carts = await this.prismaService.cART.findMany({
      where: { username },
      select: CART_SELECT,
    });

    const items = carts.map((cart) => this.toCartResponse(cart));

    return {
      items: items,
      total_items: items.reduce((sum, i) => sum + i.quantity, 0),
      tota_price: items.reduce((sum, i) => sum + i.subtotal, 0),
    };
  }

  async updateCart(
    cartItemId: number,
    request: CartRequest,
    username: string,
  ): Promise<WebModel<CartItemResponse>> {
    const updateRequest = this.validationService.validation(
      CartValidation.UDPATE,
      request,
    );
    const existing = await this.findCartOrThrow(cartItemId, username);
    if (existing.product.id !== updateRequest.product_id) {
      throw new HttpException(
        `Product id does not match the cart item with id ${updateRequest.product_id} `,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.logger.info(
      `User "${username}" updated cart item ${cartItemId} qty: ${existing.quantity} → ${updateRequest.quantity}`,
    );

    const update = await this.prismaService.cART.update({
      where: { id: cartItemId },
      data: { quantity: updateRequest.quantity },
      select: CART_SELECT,
    });

    return {
      data: this.toCartResponse(update),
    };
  }
}
