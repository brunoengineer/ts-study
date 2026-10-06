// A file with a DEFAULT export. A file can have only ONE default export.

export default function log(message: string): string {
  return `[test] ${message}`;
}
