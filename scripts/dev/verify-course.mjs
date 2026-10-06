// For course authors: checks that the course is consistent.
//   node scripts/dev/verify-course.mjs           -> all modules
//   node scripts/dev/verify-course.mjs 03 04     -> only some modules
// For every module it checks:
//   1. the solution passes and has 0 type errors
//   2. every exercise FAILS before the learner touches it (otherwise it teaches nothing)
//   3. exercises and solution have the same test titles
//   4. LESSON.md, HINTS.md and drills/cards/<module>.json exist and the cards are valid
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, c, listModules, findModule, runPlaywright, typeErrorsIn } from '../lib.mjs';

const wanted = process.argv.slice(2);
const modules = wanted.length ? wanted.map((q) => findModule(q)).filter(Boolean) : listModules('modules');
let problems = 0;
const fail = (m, msg) => { problems++; console.log(`  ${c.red('✘')} ${msg}`); };
const ok = (msg) => console.log(`  ${c.green('✔')} ${msg}`);

for (const m of modules) {
  console.log(`\n${c.bold(m)}`);
  for (const f of ['LESSON.md', 'HINTS.md', 'exercises.spec.ts']) {
    if (!fs.existsSync(path.join(ROOT, 'modules', m, f))) fail(m, `missing modules/${m}/${f}`);
  }
  if (!fs.existsSync(path.join(ROOT, 'solutions', m, 'solution.spec.ts'))) fail(m, `missing solutions/${m}/solution.spec.ts`);

  const cardsFile = path.join(ROOT, 'drills', 'cards', `${m}.json`);
  if (!fs.existsSync(cardsFile)) fail(m, `missing drills/cards/${m}.json`);
  else {
    try {
      const cards = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      const bad = cards.filter((x) => !x.id || !x.q || !x.a);
      if (bad.length) fail(m, `${bad.length} cards without id/q/a`);
      else ok(`${cards.length} drill cards`);
    } catch (e) { fail(m, `cards JSON invalid: ${e.message}`); }
  }

  const sol = runPlaywright({ kind: 'solutions', name: m, showOutput: false });
  const solPassed = sol.tests.filter((t) => t.status === 'passed').length;
  if (sol.tests.length === 0) fail(m, `solution did not run ${(sol.loadErrors ?? []).join(' ').slice(0, 500)}`);
  else if (solPassed !== sol.tests.length) {
    fail(m, `solution: ${solPassed}/${sol.tests.length} pass. Failing: ${sol.tests.filter((t) => t.status !== 'passed').map((t) => t.title).join(' | ')}`);
  } else ok(`solution passes (${solPassed} tests)`);
  const solTypes = typeErrorsIn(`solutions/${m}`);
  if (solTypes.length) fail(m, `solution has type errors:\n      ${solTypes.slice(0, 8).map((e) => `${e.file}:${e.line} ${e.message}`).join('\n      ')}`);
  else ok('solution has 0 type errors');

  const ex = runPlaywright({ kind: 'modules', name: m, showOutput: false });
  if (ex.tests.length === 0) fail(m, `exercises did not run ${(ex.loadErrors ?? []).join(' ').slice(0, 500)}`);
  // '(types only)' exercises pass at runtime on purpose: the bug is a type error.
  const passingUnsolved = ex.tests.filter((t) => t.status === 'passed' && !t.title.includes('(types only)'));
  if (passingUnsolved.length) fail(m, `exercises that pass BEFORE being solved: ${passingUnsolved.map((t) => t.title).join(' | ')}`);
  else if (ex.tests.length) ok(`all ${ex.tests.length} exercises start red`);

  const a = ex.tests.map((t) => t.title).sort().join('\n');
  const b = sol.tests.map((t) => t.title).sort().join('\n');
  if (ex.tests.length && sol.tests.length && a !== b) fail(m, 'exercise and solution test titles differ');
}

console.log(problems ? c.red(`\n${problems} problem(s) found.\n`) : c.green('\nAll good!\n'));
process.exit(problems ? 1 : 0);
