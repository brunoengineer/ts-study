// Types can be exported too. Import them with `import type { TestUser } from './utils/users';`

export type TestUser = {
  username: string;
  password: string;
  role: 'admin' | 'user';
};

export const DEFAULT_PASSWORD = 'secret123';

export function createUser(username: string): TestUser {
  return { username, password: DEFAULT_PASSWORD, role: 'user' };
}
