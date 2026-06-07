import { CartRequest } from 'src/model/cart.model';
import z, { ZodType } from 'zod';

export class CartValidation {
  static readonly ADD: ZodType<CartRequest> = z.object({
    product_id: z.coerce.number().positive(),
    quantity: z.coerce.number().positive(),
  });
  static readonly UDPATE: ZodType<CartRequest> = z.object({
    product_id: z.coerce.number().positive(),
    quantity: z.coerce.number().positive(),
  });
}
