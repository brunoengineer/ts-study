// Named exports: anything with `export` in front can be imported by other files.

export const BASE_URL = 'http://localhost:3000';

export function buildUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
