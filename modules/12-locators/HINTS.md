# Hints · Module 12

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**12.1** Count the employees in the table on the playground. Each row has one Edit button.

**12.2** By default `name` matches a PART of the name, ignoring case. With `exact: true` the WHOLE name must be exactly `'Open'`. Is any button called just "Open"?

**12.3** `const employeesHeading = page.getByRole('heading', { name: '...', level: 2 });`. No `await`: creating a locator does nothing yet.

**12.4** Two lines, roles `'radio'` and `'checkbox'`, each with `{ name: '...' }`.

**12.5** `const email = page.getByLabel('...');` then `await email.fill('...');`.

**12.6** `await page.getByPlaceholder('What needs to be done?').fill('...');` then click the button named `'Add'`.

**12.7** `getByText('QA')` = "contains qa, any case". Look at the header of the page: is there any other text with "QA" in it? With `exact: true`, that one is out.

**12.8** `await expect(page.getByTestId('...')).toHaveText('...');`. The test id and the text are in the comment.

**12.9** Every `<tr>` is a row, including the header row with "Name / Department / Salary / Action".

**12.10** Copy the shape from the comment. The text is `'Carla Souza'` and the button name is `'Edit'`.

**12.11** Start from the rows: `page.getByRole('row').filter({ hasText: '...' })`, then find the Edit button INSIDE that row.

**12.12** Who is in QA? Then: which rows do NOT contain "QA"? Don't forget the header row.

**12.13** `const dataRows = rows.filter({ has: page.getByRole('button') });`. The inner locator starts from `page`.

**12.14** Same shape as 12.13, but inside `has:` use `page.getByRole('cell', { name: 'Design', exact: true })`. Why exact? "Design" alone is safe here, but exact makes your intent clear.

**12.15** Two lines: `await expect(rows.nth(1)).toContainText('...');` and the same with `rows.last()`.

**12.16** Count: nth(0) is the header, nth(1) Alice, nth(2) Bruno, nth(3)... Write the 4 cells as an array of strings, the Edit button cell included.

**12.17** `const helloMessage = page.getByText(/hello, sam/i);`. The `i` after the regex means "ignore case".

**12.18** Count the products in the README of the practice app. Then: which product names contain "T-Shirt"?

**12.19** `const fleecePrice = cards.filter({ hasText: 'Fleece Jacket' }).locator('.price');`.

**12.20** `names` is a normal array: `expect(names).toHaveLength(...)` and `expect(names).toContain('...')`. No `await` here: these are generic assertions on a value.

**12.21** `page.getByRole('button', { name: 'Add to cart' }).or(page.getByRole('button', { name: 'Sold out' }))`. For the card: `cards.filter({ has: page.getByRole('button', { name: 'Sold out' }) })`.
