// Loads the drill cards and saves your review history (drills/progress.json).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const CARDS_DIR = path.join(ROOT, 'drills', 'cards');
const STATE_FILE = path.join(ROOT, 'drills', 'progress.json');

/**
 * Every card has:
 *   id     unique id, e.g. "01-const"
 *   q      the question / task
 *   a      the answer (code cards: one line of code)
 *   type   "code" (default: you type the answer) or "concept" (you think, then reveal)
 *   alt    optional list of other accepted answers
 *   hint   optional hint shown when you type ?
 *   note   optional explanation shown after you answer
 */
export function loadCards() {
  if (!fs.existsSync(CARDS_DIR)) return [];
  const files = fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.json')).sort();
  const cards = [];
  for (const file of files) {
    const module = file.replace(/\.json$/, '');
    try {
      const list = JSON.parse(fs.readFileSync(path.join(CARDS_DIR, file), 'utf8'));
      for (const card of list) cards.push({ type: 'code', ...card, module });
    } catch (error) {
      console.error(`Could not read drills/cards/${file}: ${error.message}`);
    }
  }
  return cards;
}

export function loadState() {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return { cards: {}, started: [], streak: 0, lastSession: null, sessions: 0, reviews: 0, ...state };
  } catch {
    return { cards: {}, started: [], streak: 0, lastSession: null, sessions: 0, reviews: 0 };
  }
}

export function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/** Called by `npm run check NN`: starting a module unlocks its drill cards. */
export function markModuleStarted(moduleName) {
  if (process.env.COURSE_NO_STATE) return; // course authors: don't touch the learner's drill history
  const state = loadState();
  if (!state.started.includes(moduleName)) {
    state.started.push(moduleName);
    state.started.sort();
    saveState(state);
  }
}
