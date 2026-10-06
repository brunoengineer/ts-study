# The Method

## How to learn syntax when you "can't memorise syntax"

Here's something nobody tells beginners: **professional developers don't memorise syntax by reading it either.**
What they have instead is:

1. **Recognition.** They've seen each shape hundreds of times, so they can read it instantly.
2. **Muscle memory** for the 20% of syntax they type 80% of the time.
3. **Fast lookup** for everything else: autocomplete, docs, their own old code, cheat sheets.

Reading a tutorial gives you none of these. **Typing, recalling and repeating** gives you all three.
That's why this course makes you write a lot of code and makes you *remember* it, instead of just showing it to you.

---

## The loop (do this for every module)

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │  1. READ  →  2. TYPE  →  3. DO  →  4. RECALL  →  5. REBUILD  →  6. REVIEW │
 └────────────────────────────────────────────────────────────────────────┘
```

| Step | What | Time | Why it works |
|---|---|---|---|
| **1. READ** | Read `LESSON.md`. Say every 🗣️ line out loud. Don't try to memorise. | 15-25 min | You build a mental map: what exists, and what it looks like. |
| **2. TYPE** | Type the ✍️ warm-up into `scratch/playground.ts` and run `npm run play`. **Never paste.** | 5 min | Your fingers learn the shape. Typing is slower than pasting, and that's what makes it stick. |
| **3. DO** | `npm run check NN`. Solve the exercises one by one. | 30-90 min | You **produce** code to reach a goal. That's the strongest way to learn. |
| **4. RECALL** | `npm run drill`, every day, even on days you don't study. | 10-15 min | Pulling something out of memory strengthens it more than re-reading it ("retrieval practice"). |
| **5. REBUILD** | The 🥋 kata: blank file, from memory. Stuck? Peek, **delete everything**, start over. | 10 min | A blank page is the real test. It turns "I recognise it" into "I can write it". |
| **6. REVIEW** | Once a week, redo an old kata. Once a month, rebuild a mini framework from scratch. | 20 min | Spacing: the forgetting curve is beaten by coming back right before you forget. |

---

## The 8 rules

### 1. Never copy-paste while learning
Copy-paste puts the code in the file but nothing in your head. **Type everything**, even when it's boring.
It's a big part of why this works.

### 2. Predict before you run
For every 🔮 exercise, and whenever you're unsure, **decide what you think will happen first**, then run.
Being wrong and seeing why is when you learn most.

### 3. Read the error before you touch the code
Read the error message **out loud**. Look at `Expected` vs `Received`. Look at the line number.
Most errors tell you exactly what's wrong. Every lesson has a "⚠️ error messages decoded" table, and
[cheatsheets/errors.md](cheatsheets/errors.md) collects them all.

### 4. The stuck ladder
When you're stuck, climb one step at a time:

1. Re-read the exercise comment slowly. What exactly does it ask?
2. Try for **10-15 minutes**. Experiment in the playground.
3. Re-read the relevant section of `LESSON.md`.
4. Open `HINTS.md` and read **only** that exercise's hint.
5. `npm run solution NN`, then open the solution file.

**If you looked at the solution:** close it, do something else for 5 minutes, then write the answer
**from memory**. Looking isn't cheating, but copying is.

### 5. Turn off AI autocomplete while learning
`.vscode/settings.json` in this folder disables inline suggestions and Copilot. If the editor finishes your
lines, you never practise remembering them. (Normal IntelliSense with `Ctrl+Space` stays on. That's a real
skill: knowing what to look for.)

### 6. Use AI as a tutor, not as a solver
Good questions to ask an AI while studying:

- "Don't give me the answer. Give me a small hint for this exercise: ..."
- "Explain this error message in simple words: ..."
- "Show me 3 different examples of `Array.filter` with test data, then quiz me."
- "Here is my code. Is there anything a senior QA engineer would write differently? Don't rewrite it, just list the points."

Bad: "Solve this exercise." It works, and you learn nothing.

### 7. Say it out loud
Every lesson has 🗣️ **Say it** lines. Reading syntax aloud ("constant **user**, of type **User**, equals...")
connects the symbols with words, which is much easier to remember than symbols alone. Do it when you type, too.

### 8. Small and daily beats big and weekly
20 minutes every day is much better than 3 hours on Sunday. On busy days, do **only** `npm run drill`.
That keeps the streak and the memories alive.

---

## Syntax is just 12 shapes

TypeScript test code looks like a lot of syntax. It's really **12 shapes**, combined over and over.
Learn to *see* them and any test file becomes readable.

```ts
// 1. Store a value
const baseUrl = 'http://localhost:3000';

// 2. Call a method on something:   thing.method(arguments)
username.trim();

// 3. Wait for something slow
await page.goto('/login');

// 4. Check something
expect(actual).toBe(expected);
await expect(locator).toBeVisible();

// 5. Find an element
page.getByRole('button', { name: 'Log in' });

// 6. An object { key: value }  and an array [a, b]
const user = { username: 'admin', role: 'admin' };
const names = ['Backpack', 'Bike Light'];

// 7. A function (input → output)
const double = (n: number): number => n * 2;

// 8. A callback: a function you pass to another function
names.filter((name) => name.startsWith('B'));

// 9. A type: the shape of your data
interface User { username: string; role: 'admin' | 'user' }

// 10. A test
test('user can log in', async ({ page }) => { /* ... */ });

// 11. A class (page objects)
class LoginPage { constructor(readonly page: Page) {} }

// 12. Import / export: share code between files
import { LoginPage } from './pages/LoginPage';
```

When a line confuses you, ask "which shapes is this made of?" For example
`await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();` is
shape 3 + shape 4 + shape 5 + shape 6.

---

## Your daily routine

| Day type | What to do |
|---|---|
| **Normal day (60 min)** | 10 min `npm run drill` → 40 min current module → 10 min kata or redo yesterday's hardest exercise |
| **Busy day (15 min)** | `npm run drill`. That's it. Keep the streak. |
| **Weekend (optional, 30-60 min)** | Redo 2 old katas from memory. Pick 3 old exercises, delete your answers, solve again. |
| **End of each part** | Check [ROADMAP.md](ROADMAP.md) and update your progress journal. |

---

## When you forget syntax at work (it will happen, forever, to everyone)

This is normal and fine. You'll have a toolkit:

1. **[cheatsheets/](cheatsheets/)**: one page per topic, plus [templates.md](cheatsheets/templates.md) with ready skeletons
2. **`npx playwright codegen`**: click around the app and Playwright writes the code. Then *read* it and clean it up.
3. **VS Code**: `Ctrl+Space` (suggestions), hover (see types), `F12` (go to definition), `Ctrl+.` (quick fixes)
4. **Your own katas** in `my-katas/`: code *you* wrote, which is the easiest to re-read
5. **The official docs**: https://playwright.dev/docs/intro and https://www.typescriptlang.org/docs/handbook/

Looking things up isn't failing. Being able to look things up quickly is part of the skill.
