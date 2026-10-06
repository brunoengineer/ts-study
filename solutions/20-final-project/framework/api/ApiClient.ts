import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Cart, NewProduct, Product } from '../utils/types';

/**
 * One method per endpoint of the QA Shop API.
 * - login() remembers the token; later calls send it as a Bearer header.
 * - Every method THROWS when the response is not 2xx, so a failing call can't go unnoticed.
 */
export class ApiClient {
  private token: string | undefined;

  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async check(response: APIResponse, action: string): Promise<void> {
    if (!response.ok()) {
      throw new Error(`${action} failed: ${response.status()} ${await response.text()}`);
    }
  }

  async login(username: string, password: string): Promise<string> {
    const response = await this.request.post('/api/login', { data: { username, password } });
    await this.check(response, `login as ${username}`);
    const body = await response.json();
    this.token = body.token;
    return body.token;
  }

  async reset(): Promise<void> {
    const response = await this.request.post('/api/reset');
    await this.check(response, 'reset');
  }

  async getProducts(params: { category?: string; search?: string } = {}): Promise<Product[]> {
    const response = await this.request.get('/api/products', { params });
    await this.check(response, 'get products');
    return response.json();
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.request.get(`/api/products/${id}`);
    await this.check(response, `get product ${id}`);
    return response.json();
  }

  async createProduct(data: NewProduct): Promise<Product> {
    const response = await this.request.post('/api/products', { headers: this.headers(), data });
    await this.check(response, 'create product');
    return response.json();
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.request.delete(`/api/products/${id}`, { headers: this.headers() });
    await this.check(response, `delete product ${id}`);
  }

  async getCart(): Promise<Cart> {
    const response = await this.request.get('/api/cart', { headers: this.headers() });
    await this.check(response, 'get cart');
    return response.json();
  }

  async addToCart(productId: number, quantity = 1): Promise<Cart> {
    const response = await this.request.post('/api/cart', { headers: this.headers(), data: { productId, quantity } });
    await this.check(response, `add product ${productId} to the cart`);
    return response.json();
  }
}
