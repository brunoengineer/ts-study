# TypeScript for Playwright: a hands-on course

Learn TypeScript **by writing tests**, then use it to build real Playwright automation:
locators, assertions, page objects, fixtures, authentication, API tests, mocking and a framework of your own.

You don't learn by reading here. You learn by **typing, failing, fixing and remembering**:

- **441 exercises** across 21 modules that start red ❌ and that you turn green ✅
- **A practice web shop** (QA Shop) running on your machine, with a UI and a REST API to test
- **522 drill cards** with spaced repetition, so syntax gets into your long-term memory
- **Katas**: blank-page challenges that prove you can write it without looking
- **Cheat sheets and templates** for the rest of your career

> First, read **[METHOD.md](METHOD.md)** (10 minutes). It explains *how* to study with this course,
> and why it works even if you find syntax hard to memorise.

---

## Setup (once)

You need [Node.js](https://nodejs.org) 20+ and [VS Code](https://code.visualstudio.com/).

```bash
npm install
npx playwright install chromium
```

In VS Code, install the recommended extension **Playwright Test for VS Code** (VS Code will suggest it).

Then start:

```bash
npm run check 00
```

---

## Commands you'll use every day

| Command | What it does |
|---|---|
| `npm run check 03` | Check module 03's exercises. Stops at the first failure and tells you what to fix next. |
| `npm run check 03 all` | Run all exercises of module 03, even after failures |
| `npm run check 13 headed` | Watch the browser while the tests run |
| `npm run check 13 ui` | Open Playwright UI mode (time-travel debugging) |
| `npm run solution 03` | Run the reference solution (open `solutions/03-*/` to read it) |
| `npm run drill` | 🧠 Daily syntax drill (spaced repetition) |
| `npm run drill 05` | Drill only module 05's cards |
| `npm run drill cram 05` | Practise all cards of module 05 now |
| `npm run drill stats` | How many cards you know |
| `npm run progress` | 📊 Dashboard of the whole course |
| `npm run kata 03` | Run your kata files in `my-katas/` whose name contains 03 |
| `npm run play` | Run `scratch/playground.ts` (try anything) |
| `npm run app` | Start QA Shop yourself → http://localhost:3000 |
| `npm run report` | Open the last HTML report |

---

## The course

| # | Module | You learn | Time* |
|---|---|---|---|
| | **Part 1 · TypeScript, the language** | | |
| 00 | [Start Here](modules/00-start-here/LESSON.md) | How tests and this course work, your first `expect` | 1 h |
| 01 | [Variables and Types](modules/01-variables-and-types/LESSON.md) | `const`/`let`, basic types, annotations, `typeof`, `===` | 2 h |
| 02 | [Strings and Numbers](modules/02-strings-and-numbers/LESSON.md) | Template literals, string methods, parsing prices, `Math`, regex basics | 3 h |
| 03 | [Functions](modules/03-functions/LESSON.md) | Functions, arrow functions, parameters, return types, callbacks | 3 h |
| 04 | [Arrays](modules/04-arrays/LESSON.md) | `map`, `filter`, `find`, `some`, `every`, `reduce`, `sort`, destructuring | 4 h |
| 05 | [Objects](modules/05-objects/LESSON.md) | Objects, `type` vs `interface`, destructuring, spread, `Record`, JSON | 4 h |
| 06 | [Control Flow and Errors](modules/06-control-flow-and-errors/LESSON.md) | `if`, ternary, `switch`, loops, `?.`, `??`, `try/catch`, `throw` | 3 h |
| 07 | [Union Types and Narrowing](modules/07-union-types-and-narrowing/LESSON.md) | Unions, literal types, narrowing, `as const`, enums, `unknown` | 3 h |
| 08 | [Async Await](modules/08-async-await/LESSON.md) | Promises, `async`/`await`, `Promise.all`, **the forgotten `await` bug** | 4 h |
| 09 | [Classes](modules/09-classes/LESSON.md) | Classes, constructors, `private`/`readonly`, `extends`: the base of page objects | 3 h |
| 10 | [Modules and Generics](modules/10-modules-and-generics/LESSON.md) | `import`/`export`, generics, `Partial`, `Pick`, `Omit`, `Record` | 4 h |
| | **Part 2 · Playwright** | | |
| 11 | [First Playwright Test](modules/11-first-playwright-test/LESSON.md) | `page`, `goto`, config, hooks, codegen, UI mode, trace viewer | 3 h |
| 12 | [Locators](modules/12-locators/LESSON.md) | `getByRole`, `getByLabel`, `getByTestId`, filtering, chaining, strict mode | 4 h |
| 13 | [Actions](modules/13-actions/LESSON.md) | click, fill, check, select, hover, upload, dialogs, new tabs | 3 h |
| 14 | [Assertions](modules/14-assertions/LESSON.md) | Web-first assertions, soft, poll, `toPass`, generic matchers | 4 h |
| 15 | [Page Object Model](modules/15-page-object-model/LESSON.md) | Page classes, components, base pages | 5 h |
| 16 | [Fixtures](modules/16-fixtures/LESSON.md) | `test.extend`, setup/teardown, worker fixtures, options | 5 h |
| 17 | [Authentication](modules/17-authentication/LESSON.md) | `storageState`, setup projects, multiple roles, API login | 4 h |
| 18 | [API Testing](modules/18-api-testing/LESSON.md) | `request`, CRUD, auth tokens, negative tests, API + UI | 5 h |
| 19 | [Test Data, Mocking and Utils](modules/19-test-data-mocking-and-utils/LESSON.md) | Builders, unique data, env vars, data-driven tests, `page.route`, tags | 5 h |
| 20 | [Final Project](modules/20-final-project/LESSON.md) | Build your own framework from scratch | 10-15 h |

\* Rough time for lesson + exercises. Take as long as you need: understanding beats speed.

Suggested pace: **1 hour a day → about 10-12 weeks**. See [ROADMAP.md](ROADMAP.md) for a week-by-week plan and your progress journal.

---

## Folder map

```
ts-study/
├── README.md            ← you are here
├── METHOD.md            ← how to study (read first!)
├── ROADMAP.md           ← week-by-week plan + your progress journal
├── modules/             ← one folder per module
│   └── 03-functions/
│       ├── LESSON.md          the lesson
│       ├── exercises.spec.ts  your exercises (you edit this)
│       └── HINTS.md           one hint per exercise
├── solutions/           ← reference solutions (look only when stuck!)
├── cheatsheets/         ← one-page references: TypeScript, Playwright, templates, errors
├── drills/cards/        ← the drill cards (your drill history: drills/progress.json)
├── my-katas/            ← your blank-page katas
├── scratch/             ← playground.ts for experiments
├── practice-app/        ← QA Shop, the app you test (see its README)
├── helpers/             ← the ___ blank and todo() used in exercises
└── scripts/             ← the check / drill / progress tools
```

## Cheat sheets

- [TypeScript](cheatsheets/typescript.md): the language on one page
- [Playwright](cheatsheets/playwright.md): locators, actions, assertions, config, API
- [Templates](cheatsheets/templates.md): skeletons for a test file, page object, fixture, auth setup, API test and config
- [Errors](cheatsheets/errors.md): error messages decoded

## Want to restart a module?

Your answers live in `modules/`. To start a module from scratch, keep a clean copy before you begin
(for example with git: `git init` now, commit, and use `git checkout -- modules/03-functions` to restore it later).
