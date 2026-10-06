// Everything that comes from the environment, in ONE place, with fallbacks for local runs.
import path from 'node:path';

export const PORT = Number(process.env.PORT ?? 3000);

// The state files written by tests/auth.setup.ts (.auth/ is gitignored: they hold real session cookies).
export const USER_STATE = path.join(import.meta.dirname, '..', '.auth', 'user.json');
export const ADMIN_STATE = path.join(import.meta.dirname, '..', '.auth', 'admin.json');

export const USER = {
  username: process.env.SHOP_USER ?? 'standard_user',
  password: process.env.SHOP_USER_PASSWORD ?? 'secret123',
};

export const ADMIN = {
  username: process.env.SHOP_ADMIN ?? 'admin',
  password: process.env.SHOP_ADMIN_PASSWORD ?? 'admin123',
};
