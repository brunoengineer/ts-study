// Syntax drills with spaced repetition.
//
//   npm run drill             review what is due today + a few new cards from modules you started
//   npm run drill 03          drill module 03 (due + new cards)
//   npm run drill cram 03     practise every card of module 03 now (doesn't change your schedule)
//   npm run drill stats       see how many cards you know per module
//
// How it works (Leitner boxes): every card lives in a box. Get it right -> it moves up a box and
// comes back later (1, 3, 7, 14, 30, 60, 120 days). Get it wrong -> back to box 1 and you type the
// correct answer once to lock it in. Cards you know well appear rarely; cards you forget appear often.
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { c, bar, findModule, listModules, moduleTitle } from './lib.mjs';
import { loadCards, loadState, saveState, markModuleStarted } from './drill-store.mjs';

const DAY = 24 * 60 * 60 * 1000;
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60, 120]; // index = box
const MAX_BOX = INTERVAL_DAYS.length - 1;
const NEW_PER_SESSION = 7;
const MAX_REVIEWS = 30;

const args = process.argv.slice(2).map((a) => a.toLowerCase());
const cards = loadCards();
const state = loadState();

if (cards.length === 0) {
  console.log(c.yellow('\nNo drill cards found in drills/cards/.\n'));
  process.exit(0);
}

if (args[0] === 'stats') {
  printStats();
  process.exit(0);
}

const cram = args[0] === 'cram';
const moduleQuery = cram ? args[1] : args[0];
const moduleName = moduleQuery ? findModule(moduleQuery) : null;
if (moduleQuery && !moduleName) {
  console.log(c.red(`\nNo module matches "${moduleQuery}". Modules: ${listModules().join(', ')}\n`));
  process.exit(1);
}
if (cram && !moduleName) {
  console.log(c.red('\nUsage: npm run drill cram 03\n'));
  process.exit(1);
}
if (moduleName) markModuleStarted(moduleName);

const queue = buildQueue();
if (queue.length === 0) {
  console.log(`\n${c.green('🎉 Nothing to review right now.')}`);
  if (state.started.length === 0) {
    console.log(`Start a module with ${c.bold('npm run check 00')} (that unlocks its cards), or drill one directly: ${c.bold('npm run drill 00')}`);
  } else {
    console.log(`Come back tomorrow, or practise a module anyway: ${c.bold('npm run drill cram 01')}`);
  }
  console.log('');
  process.exit(0);
}

await runSession(queue);

// ---------------------------------------------------------------------------

function buildQueue() {
  const now = Date.now();
  const pool = moduleName ? cards.filter((card) => card.module === moduleName) : cards.filter((card) => state.started.includes(card.module));
  if (cram) return shuffle([...pool]);
  const due = shuffle(pool.filter((card) => state.cards[card.id] && state.cards[card.id].due <= now)).slice(0, MAX_REVIEWS);
  const fresh = pool.filter((card) => !state.cards[card.id]).slice(0, moduleName ? 15 : NEW_PER_SESSION);
  return [...due, ...fresh];
}

async function runSession(queue) {
  const rl = createPrompter();

  const reviewCount = queue.filter((card) => state.cards[card.id]).length;
  console.log(`\n${c.bold(c.magenta('🧠 Syntax drill'))}  ${cram ? c.yellow('cram mode (schedule not changed)') : ''}`);
  console.log(c.dim(`${queue.length} cards (${cram ? queue.length : reviewCount} to review, ${cram ? 0 : queue.length - reviewCount} new). Type your answer and press Enter.`));
  console.log(c.dim('Type ? for a hint. Press Enter on an empty line if you don\'t know (that\'s fine: you will learn it now).'));

  const retry = [];
  let right = 0;
  let index = 0;
  const all = [...queue];
  while (all.length > 0) {
    const card = all.shift();
    index++;
    const isRetry = retry.includes(card);
    const result = await ask(rl, card, index, queue.length + retry.length, isRetry);
    if (result === 'right' && !isRetry) right++;
    if (!cram && !isRetry) schedule(card, result);
    if (result === 'wrong' && !isRetry) {
      retry.push(card);
      all.push(card); // see it once more at the end of the session
    }
    state.reviews++;
    saveState(state);
  }

  finishSession();
  const total = queue.length;
  console.log(`\n${c.bold('━'.repeat(60))}`);
  console.log(`${c.bold('Session done!')}  ${bar(right, total)} first-try score: ${right}/${total}`);
  console.log(`🔥 Streak: ${c.bold(String(state.streak))} day(s)  ·  Total reviews: ${state.reviews}`);
  console.log(c.dim('Tip: the cards you missed come back tomorrow. Short daily sessions beat long weekly ones.\n'));
  rl.close();
}

async function ask(rl, card, index, total, isRetry) {
  const info = state.cards[card.id];
  const label = `${card.module.slice(0, 2)} ${moduleTitle(card.module)}`;
  const tag = isRetry ? c.yellow('again') : info ? `box ${info.box}` : c.cyan('new');
  console.log(`\n${c.dim('─'.repeat(60))}`);
  console.log(c.dim(`Card ${index}/${total} · ${label} · `) + tag);
  console.log(`\n${c.bold(card.q)}\n`);

  if (card.type === 'concept') {
    await rl.question(c.dim('Think of the answer, then press Enter to reveal... '));
    console.log(`\n${c.green(card.a)}`);
    if (card.note) console.log(c.dim(`\n💡 ${card.note}`));
    return selfGrade(rl);
  }

  let usedHint = false;
  let answer = await rl.question(c.cyan('> '));
  while (answer.trim() === '?') {
    usedHint = true;
    console.log(c.yellow(`💡 ${card.hint ?? autoHint(card.a)}`));
    answer = await rl.question(c.cyan('> '));
  }

  if (answer.trim() !== '' && matches(answer, card)) {
    console.log(c.green(`✔ Correct!${usedHint ? ' (with a hint, so it stays in the same box)' : ''}`));
    if (normalize(answer) !== normalize(card.a)) console.log(c.dim(`  Also written as: ${card.a}`));
    if (card.note) console.log(c.dim(`💡 ${card.note}`));
    return usedHint ? 'almost' : 'right';
  }

  if (answer.trim() === '') {
    console.log(`${c.dim('Answer:')}   ${c.green(card.a)}`);
  } else {
    showDifference(answer, card.a);
  }
  if (card.note) console.log(c.dim(`💡 ${card.note}`));

  if (answer.trim() !== '') {
    const yes = (await rl.question(c.dim('Was your answer correct anyway (another valid way to write it)? (y/N) '))).trim().toLowerCase();
    if (yes === 'y' || yes === 'yes') return usedHint ? 'almost' : 'right';
  }

  // Lock it in: type the correct answer once.
  console.log(c.magenta('✍️  Type the correct answer once to lock it in (your fingers learn too):'));
  for (let attempt = 0; attempt < 3; attempt++) {
    const copy = await rl.question(c.cyan('> '));
    if (copy.trim() === '') break;
    if (matches(copy, card)) {
      console.log(c.green('✔ Locked in.'));
      break;
    }
    showDifference(copy, card.a);
  }
  return 'wrong';
}

async function selfGrade(rl) {
  const g = (await rl.question(c.dim('Did you know it? (y = yes, a = almost, n = no) '))).trim().toLowerCase();
  if (g.startsWith('y')) return 'right';
  if (g.startsWith('a')) return 'almost';
  return 'wrong';
}

function schedule(card, result) {
  const now = Date.now();
  const info = state.cards[card.id] ?? { box: 0, due: now, right: 0, wrong: 0 };
  if (result === 'right') {
    info.box = Math.min(info.box + 1, MAX_BOX);
    info.right++;
  } else if (result === 'almost') {
    info.box = Math.max(info.box, 1);
  } else {
    info.box = 1;
    info.wrong++;
  }
  info.due = now + INTERVAL_DAYS[info.box] * DAY - 60 * 60 * 1000; // an hour of slack
  info.last = now;
  state.cards[card.id] = info;
}

function finishSession() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - DAY).toDateString();
  if (state.lastSession !== today) {
    state.streak = state.lastSession === yesterday ? (state.streak ?? 0) + 1 : 1;
    state.lastSession = today;
  }
  state.sessions++;
  saveState(state);
}

// ---------- input ----------

/**
 * A line reader that never loses input: lines typed (or pasted) before a question
 * is asked are queued. Ctrl+C or the end of the input saves and exits.
 */
function createPrompter() {
  const rl = readline.createInterface({ input, output, terminal: Boolean(input.isTTY) });
  const queued = [];
  const waiting = [];
  const bye = () => {
    console.log(c.dim('\n\nProgress saved. See you next time!\n'));
    process.exit(0);
  };
  rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : queued.push(line)));
  rl.on('SIGINT', bye);
  rl.on('close', () => {
    if (waiting.length) bye();
  });
  return {
    question(prompt) {
      output.write(prompt);
      if (queued.length) return Promise.resolve(queued.shift());
      return new Promise((resolve) => waiting.push(resolve));
    },
    close: () => rl.close(),
  };
}

// ---------- answer comparison ----------

/** Makes small style differences not matter: quotes, spaces, trailing ; and trailing commas. */
function normalize(text) {
  let s = text.trim();
  if (!s.includes('${')) s = s.replace(/`/g, "'");
  return s
    .replace(/[“”"]/g, "'")
    .replace(/;+\s*$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([^\w\s$])\s*/g, '$1')
    .replace(/,([}\])])/g, '$1');
}

function matches(answer, card) {
  const given = normalize(answer);
  return [card.a, ...(card.alt ?? [])].some((expected) => normalize(expected) === given);
}

function showDifference(given, expected) {
  const a = normalize(given);
  const b = normalize(expected);
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  console.log(`${c.dim('You typed:')} ${a.slice(0, i)}${c.red(a.slice(i) || '␣')}`);
  console.log(`${c.dim('Answer:   ')} ${b.slice(0, i)}${c.green(b.slice(i))}`);
  console.log(c.dim(`           ${' '.repeat(i)}^ first difference`));
  if (normalize(expected) !== expected.trim()) console.log(c.dim(`Formatted: ${expected}`));
}

function autoHint(answer) {
  const n = Math.max(3, Math.ceil(answer.length * 0.35));
  return `It starts with:  ${answer.slice(0, n)}…`;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function printStats() {
  const now = Date.now();
  console.log(`\n${c.bold('🧠 Drill stats')}\n`);
  console.log(c.bold('  Module                              Learned            New  Due  Mastered'));
  const modules = [...new Set(cards.map((card) => card.module))];
  for (const m of modules) {
    const list = cards.filter((card) => card.module === m);
    const seen = list.filter((card) => state.cards[card.id]);
    const due = seen.filter((card) => state.cards[card.id].due <= now).length;
    const mastered = seen.filter((card) => state.cards[card.id].box >= 4).length;
    const started = state.started.includes(m) ? ' ' : c.dim('·');
    console.log(
      `${started} ${`${m.slice(0, 2)} ${moduleTitle(m)}`.padEnd(34)} ${bar(seen.length, list.length, 12)} ${String(list.length - seen.length).padStart(4)} ${String(due).padStart(4)} ${String(mastered).padStart(9)}`,
    );
  }
  console.log(`\n  🔥 Streak: ${state.streak} day(s) · Sessions: ${state.sessions} · Reviews: ${state.reviews}`);
  console.log(c.dim('  · = module not started yet (run npm run check NN or npm run drill NN to unlock it)\n'));
}
