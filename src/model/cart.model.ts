export class AddToCartRequest {
  product_id: number;
  quantity: number;
}

export class CartItemResponse {
  id: number;
  product_name: string;
  quantity: number;
  product_id: number;
  price: number;
  product_image: string | null;
  subtotal: number;
}

export class SummaryCartResponse {
  items: CartItemResponse[];
  total_items: number;
  tota_price: number;
}
