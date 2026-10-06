# My katas 🥋

A **kata** is a blank-page challenge: you write something **from memory**, without looking.
Every module's `LESSON.md` ends with one.

## How

1. Close the lesson and the exercises.
2. Create a file here named after the module, e.g. `03-functions.spec.ts`.
3. Write the kata from memory.
4. Run it: `npm run kata 03`
5. Stuck? Peek at the lesson, then **delete your file and start again from zero**. Repeat until you
   can write it without peeking.

## Why

Recognising code ("oh yes, I know this") and *writing* code from nothing are two different skills.
Exams, interviews and real work need the second one, and katas train it.

Keep your katas. Over time this folder becomes your personal reference, written by you, in your style.

## Kata file skeleton

```ts
import { test, expect } from '@playwright/test';

test('kata: <what you practise>', async ({ page }) => {
  // ...
});
```
