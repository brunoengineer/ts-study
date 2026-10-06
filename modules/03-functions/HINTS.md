# Hints · Module 03

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**3.1** `double(double(5))`: work from the inside out. First `double(5)`, then `double` of that.

**3.2** Shape: `function greet(name: string): string { return ...; }`. The text inside the return is a template literal (module 02).

**3.3** The function calculates `a + b` and then... throws it away. Which keyword gives a value back?

**3.4** `price` is used with `.toFixed(2)`, so what type is it? Write `(price: number)`. The result is text: `): string`.

**3.5** Same shape as 3.2. The body is `return` + the price formatting from module 02 (`` `$${...}` ``).

**3.6** Arguments are matched by position: the first argument goes into the first parameter, whatever its name.

**3.7** `'Admin' === 'admin'`? Strings are compared exactly, letter case included.

**3.8** `const buildProductUrl = (id: number): string => ` and then a template literal. No `{ }`, no `return`.

**3.9** Two possible fixes: add `return` inside the `{ }`, or remove the `{ }` (and the `;` inside) to get an expression body.

**3.10** Shape:
```
const applyDiscount = (price: number, percent: number): number => {
  const discount = ...;
  return ...;
};
```

**3.11** Wrap the object in parentheses: `=> ({ ... })`.

**3.12** When the second argument is missing, the default is used. When it is given, the default is ignored.

**3.13** An optional parameter you don't pass has the value `undefined`. What does `${undefined}` put in the text?

**3.14** `const randomEmail = (domain: string = 'test.com'): string => ` + a template literal with two holes: `Date.now()` and `domain`.

**3.15** `logStep` has no `return`. What does a function without `return` give back?

**3.16** `typeof getBaseUrl` asks about the function itself. `typeof getBaseUrl()` asks about what it returns.

**3.17** `getBaseUrl` is the function. To get the URL, you have to call it.

**3.18** Line 1: `const halfPrice = (p: number): number => p / 2;`. Line 2: `applyRule(20, (p) => ...)`. Line 3: pass `halfPrice` without `( )`.

**3.19** Between `const toCents:` and `=` goes the function TYPE: `(price: number) => number`. After the `=` goes the real arrow function.

**3.20** `...numbers` collects all the arguments in a list. The loop adds them. If there are none, what is `total`?

**3.21** `const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);` Copying the regex is fine. Try to write the shape yourself first.

**3.22** With indexOf + slice: `text.slice(text.indexOf('$') + 1)` gives the text after the `$`. Wrap it in `parseFloat(...)` and return it.

**3.23** Calls inside calls are read inside-out: `parsePrice(formatPrice(15.99))`. For the second: `formatPrice(parsePrice('Total: $59.98') / 2)`.

**3.24** Look at the order of the parameters in the definition: which one comes first? Swap the arguments.
