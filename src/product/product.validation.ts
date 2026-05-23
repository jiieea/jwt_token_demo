import { ZodType, z } from 'zod';
import { ProductRequest } from '../model/product.model';

export class ProductValidation {
  static readonly ADD_PRODUCT: ZodType<ProductRequest> = z.object({
    product_name: z
      .string()
      .min(1)
      .regex(/^[A-Z].*$/, {
        message: 'Product must be start with uppercase letter',
      }),
    price: z.coerce.number().positive(),
    quantity: z.coerce.number().positive().min(0),
    product_image: z.string().optional(),
  });
}
