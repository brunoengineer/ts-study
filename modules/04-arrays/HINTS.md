# Hints · Module 04

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**4.1** Indexes start at 0. `.at(-1)` is the last one. What is at index 3 of a list with 3 items? (Not an error...)

**4.2** Shape: `const prices: number[] = [ ... ];` and `const categories: Array<string> = [ ... ];`

**4.3** `push` adds at the end. `indexOf` counts from 0. `pop` removes the LAST item and gives it back. The last answer is an array: `['...']`.

**4.4** For arrays (and objects), use the matcher that compares the content (lesson section 11).

**4.5** `expect(headings).toHaveLength(...);` and `expect(headings).toContain('...');`

**4.6** Shape:
```
let totalItems = 0;
for (const quantity of quantities) {
  totalItems += ...;
}
```

**4.7** `map` gives a new array with the same number of items. `'Backpack'.length` is 8. Does `map` change the original?

**4.8** `names.map((name) => name.toUpperCase())`

**4.9** `prices.filter((price) => ...)`: the callback returns `true` for the prices you want to keep.

**4.10** `find` gives the first matching ITEM (or `undefined`). `findIndex` gives its position (or `-1`).

**4.11** `names.find((name) => name.includes('T-Shirt'))`

**4.12** `some` = at least one. `every` = all of them. An empty list has no items, so can it have "at least one"?

**4.13** `expect(prices.every((price) => price > 0)).toBe(true);` Write the second one with `some` and `=== 0`.

**4.14** The callback gets `(sum, price)` and returns the new sum: `sum + price`. Don't forget `, 0` at the end.

**4.15** Same bug as in module 03: `{ }` without `return`. Remove the `{ }` and the `;` inside, or add `return`.

**4.16** Without a compare function, numbers are sorted as text: `'1'`, `'10'`, `'100'`, `'9'`. `a - b` = low to high, `b - a` = high to low.

**4.17** Add a compare function to `sort`: low to high is `(a, b) => a - b`.

**4.18** `sort()` changes the array you call it on. Sort a copy: `[...original].sort()`.

**4.19** `expect(namesAtoZ).toEqual([...namesAtoZ].sort());` Then the same for `namesZtoA`, adding `.reverse()` after `.sort()`.

**4.20** `join(', ')` glues the items with comma + space. `slice(0, 2)` = items 0 and 1. Spread makes a NEW array, so `names` doesn't change.

**4.21** `const [username, password] = credentials;`

**4.22** `priceTexts.map((text) => parseFloat(text.replace('$', '')))`. Then `Math.max(...prices)`.

**4.23** Chain: `products.filter((product) => product.stock > 0).map((product) => product.name)`. For the count: `products.filter(...).length`.

**4.24** `filter` always gives back an array. Which method gives back the first matching item itself?
