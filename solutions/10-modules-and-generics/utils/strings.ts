export function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '-');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
