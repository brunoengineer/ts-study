// Shared helpers for the course scripts (check, progress, drill).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAYWRIGHT_CLI = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
const TSC_CLI = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');

// ---------- colours (no dependencies) ----------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text));
export const c = {
  bold: paint('1'),
  dim: paint('2'),
  red: paint('31'),
  green: paint('32'),
  yellow: paint('33'),
  blue: paint('34'),
  magenta: paint('35'),
  cyan: paint('36'),
};

export function bar(done, total, width = 20) {
  const filled = total === 0 ? 0 : Math.round((done / total) * width);
  return c.green('█'.repeat(filled)) + c.dim('░'.repeat(width - filled));
}

// ---------- modules ----------
/** All module folders, sorted: ['00-start-here', '01-variables-and-types', ...] */
export function listModules(kind = 'modules') {
  const dir = path.join(ROOT, kind);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{2}-/.test(d.name))
    .map((d) => d.name)
    .sort();
}

/** '3' | '03' | '03-functions' | 'functions' -> '03-functions' */
export function findModule(query, kind = 'modules') {
  if (!query) return null;
  const all = listModules(kind);
  const q = String(query).toLowerCase();
  const padded = /^\d+$/.test(q) ? q.padStart(2, '0') : q;
  return all.find((m) => m.startsWith(`${padded}-`)) ?? all.find((m) => m.includes(q)) ?? null;
}

export const moduleNumber = (name) => name.slice(0, 2);
export const moduleTitle = (name) =>
  name
    .slice(3)
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

export function hasOwnConfig(kind, name) {
  return fs.existsSync(path.join(ROOT, kind, name, 'playwright.config.ts'));
}

// ---------- TypeScript ----------
let tscCache = null;
/** Runs tsc once and returns all errors as { file, line, col, message }. */
export function typeErrors() {
  if (tscCache) return tscCache;
  const result = spawnSync(process.execPath, [TSC_CLI, '-p', 'tsconfig.json', '--pretty', 'false'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const lines = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.split(/\r?\n/);
  tscCache = lines
    .map((l) => l.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+: .*)$/))
    .filter(Boolean)
    .map(([, file, line, col, message]) => ({ file: file.replace(/\\/g, '/'), line: Number(line), col: Number(col), message }));
  return tscCache;
}

export function typeErrorsIn(folder) {
  const prefix = folder.replace(/\\/g, '/').replace(/\/?$/, '/');
  return typeErrors().filter((e) => e.file.startsWith(prefix));
}

// ---------- Playwright ----------
/**
 * Runs Playwright and returns a flat list of tests:
 * { title, file, line, status: 'passed' | 'failed' | 'notrun' }
 */
export function runPlaywright({ kind, name, maxFailures = 0, showOutput = true, extraArgs = [] }) {
  // Not in test-results/: Playwright empties that folder at the start of every run.
  const reportName = `${kind}-${name || 'all'}`.replace(/[\\/.]+/g, '_');
  const jsonFile = path.join(ROOT, 'node_modules', '.cache', 'course', `${reportName}.json`);
  fs.mkdirSync(path.dirname(jsonFile), { recursive: true });
  fs.rmSync(jsonFile, { force: true });

  const folder = `${kind}/${name}`;
  const args = [PLAYWRIGHT_CLI, 'test'];
  if (hasOwnConfig(kind, name)) {
    args.push('-c', folder);
  } else {
    args.push(folder, `--project=${kind === 'modules' ? 'exercises' : 'solutions'}`);
  }
  // list = what you see, json = read by these scripts, html = for npm run report
  args.push(`--reporter=${showOutput ? 'list,html,' : ''}json`);
  if (maxFailures) args.push(`--max-failures=${maxFailures}`);
  if (process.env.COURSE_OUTPUT_DIR) args.push('--output', process.env.COURSE_OUTPUT_DIR);
  args.push(...extraArgs);

  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: showOutput ? 'inherit' : 'pipe',
    encoding: 'utf8',
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile, PLAYWRIGHT_HTML_OPEN: 'never', FORCE_COLOR: useColor ? '1' : '0' },
  });

  if (!fs.existsSync(jsonFile)) {
    return { tests: [], crashed: true, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
  }
  const report = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const tests = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      const status = spec.tests[0]?.status;
      tests.push({
        title: spec.title,
        file: path.resolve(report.config?.rootDir ?? ROOT, spec.file ?? folder),
        line: spec.line,
        status: status === 'expected' || status === 'flaky' ? 'passed' : status === 'unexpected' ? 'failed' : 'notrun',
      });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites ?? []) walk(suite);
  const loadErrors = (report.errors ?? []).map((e) => e.message ?? '').filter((m) => !m.includes('Testing stopped early'));
  return { tests, crashed: tests.length === 0 && loadErrors.length > 0, loadErrors };
}


export function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}
