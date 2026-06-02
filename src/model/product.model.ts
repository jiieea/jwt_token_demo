export class ProductRequest {
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string | null;
}

export class ProductUpdateRequest {
  id: number;
  product_name?: string;
  price?: number;
  quantity?: number;
  product_image?: string | null;
}

export class ProductUpdateResponse {
  product_name?: string;
  price?: number;
  quantity?: number;
  product_image?: string | null;
}

export class ProductResponse {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string | null;
}

export class DeleteProductResponse {
  success: boolean;
  message: string;
}

export class ProductSearchRequest {
  search?: string;
}
