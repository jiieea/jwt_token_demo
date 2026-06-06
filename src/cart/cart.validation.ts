import { AddToCartRequest } from 'src/model/cart.model';
import z, { ZodType } from 'zod';

export class CartValidation {
  static readonly ADD: ZodType<AddToCartRequest> = z.object({
    product_id: z.coerce.number().positive(),
    quantity: z.coerce.number().positive(),
  });
}
