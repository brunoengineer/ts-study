// The shapes of the QA Shop API (see practice-app/README.md).

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

// What you send to POST /api/products: name and price are required, the rest is optional.
export interface NewProduct {
  name: string;
  price: number;
  category?: string;
  stock?: number;
  description?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}
