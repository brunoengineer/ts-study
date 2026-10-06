// npm run progress  ->  runs every exercise (quietly) and shows a dashboard of your progress.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, c, bar, listModules, moduleNumber, moduleTitle, runPlaywright, typeErrorsIn, hasOwnConfig } from './lib.mjs';
import { loadState, loadCards } from './drill-store.mjs';

console.log(c.dim('\nRunning all exercises quietly... (this can take a minute)\n'));

const modules = listModules('modules');
const byModule = new Map(modules.map((m) => [m, []]));

// 1) Everything that uses the root config, in one run.
const shared = runPlaywright({ kind: 'modules', name: '', showOutput: false });
for (const t of shared.tests) {
  const rel = path.relative(path.join(ROOT, 'modules'), t.file).replace(/\\/g, '/');
  const mod = rel.split('/')[0];
  byModule.get(mod)?.push(t);
}
// 2) Modules with their own playwright.config.ts.
for (const m of modules.filter((m) => hasOwnConfig('modules', m))) {
  byModule.set(m, runPlaywright({ kind: 'modules', name: m, showOutput: false }).tests);
}

let doneModules = 0;
let totalPassed = 0;
let totalTests = 0;
let nextModule = null;

console.log(c.bold('  #   Module                          Tests                      Types'));
console.log(c.dim(`  ${'─'.repeat(74)}`));
for (const m of modules) {
  const tests = byModule.get(m) ?? [];
  const passed = tests.filter((t) => t.status === 'passed').length;
  const errors = typeErrorsIn(`modules/${m}`).length;
  const complete = tests.length > 0 && passed === tests.length && errors === 0;
  if (complete) doneModules++;
  else nextModule ??= m;
  totalPassed += passed;
  totalTests += tests.length;
  const icon = complete ? c.green('✔') : passed > 0 ? c.yellow('◐') : c.dim('○');
  const types = errors === 0 ? c.green('0') : c.yellow(String(errors));
  const count = `${passed}/${tests.length}`.padStart(6);
  console.log(`  ${icon} ${moduleNumber(m)}  ${moduleTitle(m).padEnd(30)} ${bar(passed, tests.length, 16)} ${count}   ${types}`);
}
console.log(c.dim(`  ${'─'.repeat(74)}`));
console.log(`  ${c.bold('Course')}   ${bar(doneModules, modules.length, 30)} ${doneModules}/${modules.length} modules · ${totalPassed}/${totalTests} exercises`);

// Final project (if started)
const finalDir = path.join(ROOT, 'final-project');
if (fs.existsSync(path.join(finalDir, 'playwright.config.ts'))) {
  const fp = runPlaywright({ kind: '.', name: 'final-project', showOutput: false }).tests;
  const ok = fp.filter((t) => t.status === 'passed').length;
  console.log(`  ${c.bold('Final project')}  ${ok}/${fp.length} tests passing`);
}

// Drill stats
const state = loadState();
const cards = loadCards();
const now = Date.now();
const seen = cards.filter((card) => state.cards[card.id]);
const due = seen.filter((card) => state.cards[card.id].due <= now).length;
const mastered = seen.filter((card) => state.cards[card.id].box >= 4).length;
console.log(`\n  ${c.bold('Drills')}   ${seen.length}/${cards.length} cards learned · ${c.green(String(mastered))} mastered · ${due > 0 ? c.yellow(`${due} due now`) : c.green('nothing due')} · streak ${state.streak ?? 0} day(s)`);

if (nextModule) {
  console.log(`\n  👉 Continue with ${c.bold(nextModule)}:  ${c.cyan(`npm run check ${moduleNumber(nextModule)}`)}`);
}
if (due > 0) console.log(`  🧠 You have cards to review:  ${c.cyan('npm run drill')}`);
console.log('');
