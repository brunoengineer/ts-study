// npm run check 03            -> check module 03, stop at the first failing exercise
// npm run check 03 all        -> run every exercise of module 03 (don't stop at the first failure)
// npm run check 03 headed     -> watch the browser while the tests run
// npm run check 03 ui         -> open Playwright UI mode for module 03
// npm run solution 03         -> run the reference solution of module 03
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { markModuleStarted } from './drill-store.mjs';
import { ROOT, c, bar, findModule, listModules, moduleTitle, runPlaywright, typeErrorsIn, relative, hasOwnConfig } from './lib.mjs';

const argv = process.argv.slice(2);
const solution = argv.includes('--solution');
const FLAG_WORDS = ['all', 'headed', 'ui'];
const words = argv.filter((a) => !a.startsWith('--')).map((a) => a.toLowerCase());
const flags = new Set(words.filter((w) => FLAG_WORDS.includes(w)));
const query = words.find((w) => !FLAG_WORDS.includes(w));
const kind = solution ? 'solutions' : 'modules';

if (!query) {
  console.log(`
${c.bold('Usage')}
  npm run check 03          check module 03 (stops at the first failing exercise)
  npm run check 03 all      run all exercises of module 03
  npm run check 03 headed   watch the browser while it runs
  npm run check 03 ui       open Playwright UI mode for the module
  npm run solution 03       run the reference solution
  npm run progress          see your progress in every module

${c.bold('Modules')}
${listModules().map((m) => `  ${m}`).join('\n')}
`);
  process.exit(0);
}

const name = findModule(query, kind);
if (!name) {
  console.log(c.red(`\nCould not find a module matching "${query}" in ${kind}/.`));
  console.log(`Available: ${listModules(kind).join(', ')}\n`);
  process.exit(1);
}
const folder = `${kind}/${name}`;
if (!solution) markModuleStarted(name); // unlocks this module's drill cards

// UI mode: hand over to Playwright and stop.
if (flags.has('ui')) {
  const args = [path.join(ROOT, 'node_modules/@playwright/test/cli.js'), 'test', '--ui'];
  if (hasOwnConfig(kind, name)) args.push('-c', folder);
  else args.push(folder, `--project=${solution ? 'solutions' : 'exercises'}`);
  spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
  process.exit(0);
}

console.log(`\n${c.bold(c.cyan(`▶ ${solution ? 'Solution' : 'Module'} ${name.slice(0, 2)} · ${moduleTitle(name)}`))}  ${c.dim(folder)}\n`);

const stopEarly = !flags.has('all') && !solution;
const extraArgs = flags.has('headed') ? ['--headed'] : [];
// Modules 00-10 never open a browser, so a trace on failure would only be noise.
if (Number(name.slice(0, 2)) <= 10) extraArgs.push('--trace=off');
const { tests, crashed, loadErrors } = runPlaywright({ kind, name, maxFailures: stopEarly ? 1 : 0, extraArgs });

const errors = typeErrorsIn(folder);
const passed = tests.filter((t) => t.status === 'passed').length;
const failed = tests.filter((t) => t.status === 'failed');
const total = tests.length;

console.log(`\n${c.bold('━'.repeat(60))}`);
if (stopEarly && tests.some((t) => t.status === 'notrun')) {
  console.log(c.dim('ℹ "1 error was not a part of any test" above is normal: the check stops at the first failure on purpose.'));
}

if (crashed || total === 0) {
  console.log(c.red(c.bold('\n💥 The test file could not run.')));
  console.log('This usually means a syntax error (a missing } or ) or quote) or a broken import.');
  for (const e of loadErrors ?? []) console.log(c.dim(e.split('\n').slice(0, 8).join('\n')));
  printTypeErrors(errors, 5);
  console.log(`\n👉 Fix the first error above, save the file and run ${c.bold(`npm run check ${name.slice(0, 2)}`)} again.\n`);
  process.exit(1);
}

console.log(`\n${c.bold('Exercises')}`);
for (const t of tests) {
  const icon = t.status === 'passed' ? c.green('✔') : t.status === 'failed' ? c.red('✘') : c.dim('○');
  const title = t.status === 'notrun' ? c.dim(t.title) : t.status === 'failed' ? c.red(t.title) : t.title;
  console.log(`  ${icon} ${title}`);
}

console.log(`\n  Tests        ${bar(passed, total)} ${passed}/${total}`);
console.log(`  Type errors  ${errors.length === 0 ? c.green('0 ✔') : c.yellow(String(errors.length))}`);

if (failed.length > 0) {
  const next = failed[0];
  console.log(`\n${c.bold('👉 Next:')} ${c.yellow(next.title)}`);
  console.log(`   ${c.cyan(`${relative(next.file)}:${next.line}`)}   ${c.dim('(Ctrl+click to open)')}`);
  console.log(c.dim('   Read the red error above: "Expected" is what the test wants, "Received" is what your code produced.'));
  if (!solution) console.log(c.dim(`   Stuck? 1) re-read LESSON.md  2) open HINTS.md  3) npm run solution ${name.slice(0, 2)}`));
  printTypeErrors(errors.filter((e) => e.line <= next.line + 40), 3);
} else if (errors.length > 0) {
  console.log(`\n${c.yellow(c.bold('Almost there!'))} All tests pass, but TypeScript still complains:`);
  printTypeErrors(errors, 10);
  console.log(c.dim('\n   Tests only check what your code DOES. TypeScript checks the TYPES. A module is done when both are green.'));
} else if (!solution) {
  console.log(`\n${c.green(c.bold('🎉 Module complete! Every test passes and there are no type errors.'))}`);
  console.log(`   Now do the ${c.bold('🥋 Kata')} at the end of ${c.cyan(`${folder}/LESSON.md`)} and run ${c.bold('npm run drill')}.\n`);
} else {
  console.log(`\n${c.green('✔ Solution passes.')}\n`);
}

function printTypeErrors(list, max) {
  if (list.length === 0) return;
  console.log(`\n${c.bold('TypeScript says')} ${c.dim('(these are the red squiggles in VS Code)')}`);
  for (const e of list.slice(0, max)) {
    console.log(`   ${c.cyan(`${e.file}:${e.line}:${e.col}`)} ${e.message}`);
  }
  if (list.length > max) console.log(c.dim(`   ...and ${list.length - max} more`));
}

process.exit(failed.length > 0 ? 1 : 0);
