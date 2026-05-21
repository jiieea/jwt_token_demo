export class ProductRequest {
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string | null;
}

export class ProductResponse {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string | null;
}
