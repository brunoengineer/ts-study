# Authoring guide (for whoever writes or edits modules)

The learner is a QA professional who wants to write Playwright tests in TypeScript for the rest of their career.
**They find it very hard to memorise syntax.** Everything in this course is designed around that:

- Repetition with variation: the same syntax shows up in the lesson, the warm-up, several exercises, the kata and the drill cards.
- Small steps: each exercise teaches *one* thing. The next one adds one more.
- Anatomy and read-aloud: every new piece of syntax gets a labelled breakdown (🧩) and a "🗣️ Say it" sentence.
- Patterns over memory: show the *shape* (`expect(actual).toBe(expected)`) and repeat it.
- Everything connects to real Playwright usage (🎭 sections), so the learner always knows why.
- Simple English (the learner is not a native speaker). Short sentences. No jokes that need cultural context.

**Read `modules/01-variables-and-types/` (all 3 files), `solutions/01-variables-and-types/solution.spec.ts` and
`drills/cards/01-variables-and-types.json` before you write anything. They are the template. Match their style and density.**

## Files per module

```
modules/NN-slug/LESSON.md            the lesson
modules/NN-slug/exercises.spec.ts    the exercises (all start RED)
modules/NN-slug/HINTS.md             one hint per exercise
solutions/NN-slug/solution.spec.ts   the same tests, solved (with short "why" comments where useful)
drills/cards/NN-slug.json            15-30 drill cards
```

Folder names must match exactly between `modules/`, `solutions/` and the cards file name.

## LESSON.md structure

1. `# Module NN · Title`
2. `> **Why this matters for Playwright:** ...` (2-3 lines)
3. `## 🎯 After this module you can` (bullets)
4. Numbered concept sections (`## 1. ...`). Each has a short explanation, a code example and, for every NEW syntax shape, a `### 🧩 Anatomy` diagram and/or `### 🗣️ Say it`.
   Use tables for comparisons ("when to use X vs Y").
5. `## 🎭 In Playwright you'll see`: real-world snippet(s) using the concepts
6. `## ⚠️ Common mistakes & error messages decoded`: table "You see | It means | Fix". Use REAL error messages (TypeScript and Playwright).
7. `## ✍️ Type it (warm-up, 5 minutes)`: a snippet to type (not paste) into `scratch/playground.ts`, run with `npm run play`
8. `## 🏋️ Exercises`: `npm run check NN`
9. `## 🥋 Kata`: a blank-page challenge: create `my-katas/NN-name.spec.ts` from memory, run with `npm run kata NN`
10. `## 🧠 Remember`: the absolute minimum, as one short code block (5-10 lines)
11. `## ✅ Done when`: checklist

Length: thorough but scannable. Roughly 250-450 lines for a big topic. Code examples must be correct and must type-check.
Link to other modules by number ("see module 08") when a concept depends on another.

## exercises.spec.ts rules

- Header comment exactly like module 01 (module name, run command, the 4 emoji legend).
- `import { test, expect } from '@playwright/test';` and `import { ___, todo } from '../../helpers/blank';` (import only what you use; for modules with their own config use the right relative path).
- Group with `test.describe('topic', () => { ... })`.
- Test titles: `'N.M <emoji> short description'`, e.g. `'4.7 ✍️ filter the failed tests'`. Numbering continuous within the module (N.1, N.2, ...). The emoji is one of 🔮 ✍️ 🐛 🧪.
- 15-25 exercises per module (TypeScript modules ~18-25, Playwright modules ~14-20). Mix all 4 types; start easy, finish with 2-3 "combine everything" exercises.
- Comments: tell WHAT to do precisely (names, values) and, where needed, show the *shape* (`// Shape: const name = (a: number): number => ...`). Never give the full answer in the exercise.
- ✍️ and 🧪 exercises contain `// ✍️ your code here`, a blank line, then `todo();` (or `todo('message')`) before the assertions.
- 🔮 exercises use `___`. Make sure the blank's default value (`'___ (replace me with your answer)'`) does NOT make the test pass.
- **Every exercise must FAIL before the learner touches it.** The only exception: a 🐛 exercise whose bug is purely a type error.
  Put `(types only)` at the end of its title; the verifier then allows it to pass at runtime.
- Each test is self-contained (no shared state between tests, except `beforeEach` setup you provide).
- Exercises reuse realistic test-automation data: users, products, URLs, status codes, test results, selectors, timeouts, the QA Shop.
- Avoid TypeScript errors in code the learner is NOT supposed to touch (comparing two different literal types, for example, is an error; use annotated variables). If a line must stay a type error on purpose, use `// @ts-expect-error - <why>` in BOTH files.
- Type-checking: the learner's goal is "all tests green AND 0 type errors". Unsolved exercises naturally have type errors (`Cannot find name 'x'`); that's fine.

## Playwright modules (11+)

- The practice app is **QA Shop**: read `practice-app/README.md` for every page, accessible name, test id and API endpoint. Only use what exists there.
  If you truly need a new element or endpoint, add it to `practice-app/server.mjs` AND the README. Keep it consistent and don't break existing behaviour.
- `baseURL` is configured, so use relative URLs: `await page.goto('/login')`.
- Tests that change server state (cart, products, users) must start clean: provide
  `test.beforeEach(async ({ request }) => { await request.post('/api/reset'); });` in the exercise file (not as a TODO).
- Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`), then `getByTestId`, then CSS.
- Use web-first assertions (`await expect(locator).toBeVisible()`), never fixed waits (`waitForTimeout`), except to show a bad example in the lesson.
- Make failures fast: when an exercise starts red because of `todo()`, it fails instantly. When it starts red because of a wrong locator, it would wait 5 s; that's acceptable but prefer `todo()`/`___` designs.
- A module may have its own `playwright.config.ts` (e.g. auth with a setup project). Then: it lives in `modules/NN-slug/playwright.config.ts` AND
  `solutions/NN-slug/playwright.config.ts`, the root config ignores those folders automatically, and `npm run check NN` uses `-c`.
  That config must read `const PORT = Number(process.env.PORT ?? 3000)` and use it for `baseURL` and a `webServer`
  (`command: 'node ../../practice-app/server.mjs'` with correct relative path / cwd, `url: http://localhost:${PORT}/api/health`, `reuseExistingServer: true`, `env: { PORT: String(PORT) }`), plus `workers: 1`.
  Its exercises file is still named `exercises.spec.ts` (solution: `solution.spec.ts`).
  In the exercises folder put setup/state files under `.auth/` (gitignored).

## Lessons learned while writing the course

- Warm-ups for browser modules (11+) go in `my-katas/NN-warmup.spec.ts` and run with `npm run kata NN-warmup`:
  that code needs the test runner, not `npm run play`.
- Worker-scoped fixtures make their tests run in a separate worker *after* the rest of the file, so put those exercises last.
- A missing named import crashes the whole spec file (`SyntaxError: ... does not provide an export named ...`).
  Import learner-edited files with `import * as` or a dynamic `import()` inside the test.
- A floating (un-awaited) rejected promise fails the *next* test. Never leave one behind in an unsolved exercise.
- TypeScript 7 messages differ slightly from TS 5 (e.g. no "Did you mean...?" suffix on the CLI). Quote messages from real runs.
- Run authoring checks with `COURSE_NO_STATE=1` so `check.mjs` doesn't write into the learner's `drills/progress.json`.

## HINTS.md

`# Hints · Module NN`, then the line "Read only the hint for the exercise you're stuck on. Try again before reading the next one."
Then `**N.M** hint` for EVERY exercise. A hint points the way (the shape, the method name, where in the lesson) without giving the full answer.

## solution.spec.ts

Same header as module 01's solution. Same test titles, same order, same structure. All tests pass, 0 type errors.
Short comments explain the *why* where the learner might wonder.

## Drill cards (drills/cards/NN-slug.json)

An array of cards: `{ "id": "NN-short-id", "q": "...", "a": "...", "alt": [...]?, "hint": "..."?, "note": "..."?, "type": "concept"? }`

- Most cards are **code cards**: the learner types the answer, ONE line of code. Answers are compared ignoring spaces, quote style
  and trailing `;`, so keep answers canonical (single quotes, semicolon at the end of statements, no semicolon for bare expressions).
  Give `alt` for other common correct forms.
- The question must be precise enough that there is one obvious answer (give names and values).
- Mix in some `"type": "concept"` cards (self-graded), e.g. "When do you use X?", error messages decoded.
- 15-30 cards per module. Focus on the syntax they'll type in real Playwright tests.

## Verifying (required)

Run from the project root (use your assigned PORT so you don't collide with other authors working in parallel):

```bash
PORT=31xx COURSE_OUTPUT_DIR=test-results-<you> node scripts/dev/verify-course.mjs NN
```

It must print **All good!**: solution passes, solution has 0 type errors, every exercise starts red, titles match, cards valid.
Also run `PORT=31xx node scripts/check.mjs NN` once to see what the learner sees, and make sure it's helpful.
Delete your `test-results-<you>` folder when done.
