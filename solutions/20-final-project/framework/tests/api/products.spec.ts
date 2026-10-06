import { test, expect } from '../../fixtures';
import { buildProduct } from '../../utils/data';
import { ADMIN, USER } from '../../utils/env';

test.beforeEach(async ({ api }) => {
  await api.reset();
});

test.describe('products API', { tag: '@api' }, () => {
  test('lists all products', { tag: '@smoke' }, async ({ api }) => {
    const products = await api.getProducts();
    expect(products).toHaveLength(6);
    expect(products).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Backpack', price: 29.99 })]));
  });

  test('filters by category', async ({ api }) => {
    const clothes = await api.getProducts({ category: 'clothes' });
    expect(clothes).toHaveLength(4);
    expect(clothes.every((product) => product.category === 'clothes')).toBe(true);
  });

  test('an admin can create and delete a product', async ({ api }) => {
    await api.login(ADMIN.username, ADMIN.password);
    const created = await api.createProduct(buildProduct({ price: 4.5 }));
    expect(created).toEqual(expect.objectContaining({ id: expect.any(Number), price: 4.5 }));

    await api.deleteProduct(created.id);
    await expect(api.getProduct(created.id)).rejects.toThrow(/404/);
  });

  test('a normal user cannot create products', async ({ api }) => {
    await api.login(USER.username, USER.password);
    await expect(api.createProduct(buildProduct())).rejects.toThrow(/403/);
  });
});
