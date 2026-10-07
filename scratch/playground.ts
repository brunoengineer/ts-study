// 🧪 Your playground. Try anything here, then run:   npm run play
// Nothing in this file is checked. Break things, read the errors, experiment.
// Tip: hover over a variable in VS Code to see its type.

const greeting: string = 'Hello';
const name = 'Playwright';

console.log(`${greeting}, ${name}!`);

// module 01
const site = 'QA Shop';
let visits = 0;
visits++;
visits +=10;
console.log(site, visits, typeof visits);

// Keep this line: it makes the variables above private to this file
// (without it they would leak into every other file of the project).
export {};
