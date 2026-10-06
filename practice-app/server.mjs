// QA Shop - a tiny practice web app + REST API for Playwright exercises.
// Zero dependencies. Start it with:  npm run app   ->  http://localhost:3000
// Playwright starts it automatically (see playwright.config.ts -> webServer).

import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 3000);

// ---------------------------------------------------------------------------
// Data (in memory). POST /api/reset puts everything back to this state.
// ---------------------------------------------------------------------------
const DEFAULT_USERS = [
  { username: 'standard_user', password: 'secret123', name: 'Sam Standard', role: 'user', locked: false },
  { username: 'admin', password: 'admin123', name: 'Ada Admin', role: 'admin', locked: false },
  { username: 'locked_user', password: 'secret123', name: 'Lou Locked', role: 'user', locked: true },
];

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Backpack', price: 29.99, category: 'bags', stock: 10, description: 'A sturdy backpack for all your test gear.' },
  { id: 2, name: 'Bike Light', price: 9.99, category: 'accessories', stock: 25, description: 'Light up your evening rides.' },
  { id: 3, name: 'Bolt T-Shirt', price: 15.99, category: 'clothes', stock: 40, description: 'A classic tee with a lightning bolt.' },
  { id: 4, name: 'Fleece Jacket', price: 49.99, category: 'clothes', stock: 5, description: 'Warm, soft and ready for winter.' },
  { id: 5, name: 'Onesie', price: 7.99, category: 'clothes', stock: 0, description: 'Cozy onesie for the little ones. Out of stock!' },
  { id: 6, name: 'Red T-Shirt', price: 15.99, category: 'clothes', stock: 12, description: 'Bright red tee. Very visible, like a failing test.' },
];

let users, products, carts, nextProductId, orderCounter;
const sessions = new Map(); // token -> username

function resetData() {
  users = DEFAULT_USERS.map((u) => ({ ...u }));
  products = DEFAULT_PRODUCTS.map((p) => ({ ...p }));
  carts = new Map(); // username -> [{ productId, quantity }]
  nextProductId = 7;
  orderCounter = 1000;
  // Drop sessions that belong to users that no longer exist.
  for (const [token, username] of sessions) {
    if (!users.some((u) => u.username === username)) sessions.delete(token);
  }
}
resetData();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const money = (n) => `$${n.toFixed(2)}`;
const publicUser = (u) => ({ username: u.username, name: u.name, role: u.role });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

function currentUser(req) {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : parseCookies(req).session;
  if (!token) return null;
  const username = sessions.get(token);
  return users.find((u) => u.username === username) ?? null;
}

function createSession(username) {
  const token = randomUUID();
  sessions.set(token, username);
  return token;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const type = req.headers['content-type'] ?? '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return { __invalidJson: true };
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}
const json = (res, status, data) =>
  send(res, status, data === undefined ? '' : JSON.stringify(data), { 'Content-Type': 'application/json' });
const html = (res, status, body, headers = {}) =>
  send(res, status, body, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
const redirect = (res, location, headers = {}) => send(res, 302, '', { Location: location, ...headers });

function cartFor(username) {
  const items = (carts.get(username) ?? [])
    .map((item) => {
      const p = products.find((x) => x.id === item.productId);
      return p ? { productId: p.id, name: p.name, price: p.price, quantity: item.quantity } : null;
    })
    .filter(Boolean);
  const total = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, total, count };
}

function validateProduct(body, partial) {
  if (!partial || 'name' in body) {
    if (typeof body.name !== 'string' || body.name.trim() === '') return 'name is required';
  }
  if (!partial || 'price' in body) {
    if (typeof body.price !== 'number' || !(body.price > 0)) return 'price must be a positive number';
  }
  if ('stock' in body && (!Number.isInteger(body.stock) || body.stock < 0)) return 'stock must be a whole number >= 0';
  return null;
}

// ---------------------------------------------------------------------------
// HTML layout
// ---------------------------------------------------------------------------
const STYLE = `
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; margin: 0; background: #f6f7f9; color: #1d2330; }
  header { background: #1d2330; color: #fff; padding: 12px 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  header a { color: #fff; }
  header .brand { font-weight: 700; font-size: 1.2rem; margin-right: auto; text-decoration: none; }
  main { max-width: 960px; margin: 24px auto; padding: 0 16px; }
  .card { background: #fff; border: 1px solid #dde1e7; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .product-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .price { font-weight: 700; color: #0a7a3f; }
  .error { color: #b00020; font-weight: 600; }
  .success { color: #0a7a3f; font-weight: 600; }
  label { display: block; margin-top: 8px; }
  input, select, textarea, button { font: inherit; padding: 6px 10px; }
  button { cursor: pointer; }
  table { border-collapse: collapse; width: 100%; background: #fff; }
  th, td { border: 1px solid #dde1e7; padding: 8px; text-align: left; }
  .tooltip { background: #1d2330; color: #fff; padding: 4px 8px; border-radius: 4px; }
  fieldset { margin-top: 12px; }
`;

function layout(req, title, body) {
  const user = currentUser(req);
  const count = user ? cartFor(user.username).count : 0;
  const nav = [
    '<a href="/">Home</a>',
    '<a href="/products">Products</a>',
    `<a href="/cart">Cart (<span data-testid="cart-count">${count}</span>)</a>`,
    '<a href="/playground">Playground</a>',
    user?.role === 'admin' ? '<a href="/admin">Admin</a>' : '',
    user
      ? `<span data-testid="user-name">${escapeHtml(user.name)}</span> <a href="/logout">Log out</a>`
      : '<a href="/login">Log in</a>',
  ].join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} | QA Shop</title>
  <style>${STYLE}</style>
</head>
<body>
  <header>
    <a class="brand" href="/">QA Shop</a>
    <nav aria-label="Main">
      ${nav}
    </nav>
  </header>
  <main>
${body}
  </main>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function homePage(req) {
  return layout(
    req,
    'Home',
    `<h1>Welcome to QA Shop</h1>
    <p>A practice store built for learning Playwright. Nothing here is real, so break whatever you like.</p>
    <div class="card">
      <h2>Test accounts</h2>
      <ul>
        <li><code>standard_user</code> / <code>secret123</code></li>
        <li><code>admin</code> / <code>admin123</code></li>
        <li><code>locked_user</code> / <code>secret123</code> (locked out)</li>
      </ul>
    </div>`,
  );
}

function loginPage(req, { error = '', username = '', next = '' } = {}) {
  return layout(
    req,
    'Login',
    `<h1>Login</h1>
    <form class="card" method="post" action="/login" style="max-width: 360px">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <label for="username">Username</label>
      <input id="username" name="username" autocomplete="username" value="${escapeHtml(username)}">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password">
      <p><button type="submit">Log in</button></p>
      ${error ? `<p role="alert" class="error" data-testid="login-error">${escapeHtml(error)}</p>` : ''}
    </form>`,
  );
}

function productCard(p, inCart) {
  return `<li class="card product-card" data-testid="product-card" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.price}">
        <h2>${escapeHtml(p.name)}</h2>
        <p class="price">${money(p.price)}</p>
        <p>${p.stock > 0 ? `In stock: ${p.stock}` : '<span class="error">Out of stock</span>'}</p>
        <a href="/products/${p.id}">Details</a>
        ${cartButton(p, inCart)}
      </li>`;
}

function cartButton(p, inCart) {
  if (p.stock === 0) return '<button disabled>Sold out</button>';
  return `<button class="cart-button" data-product-id="${p.id}">${inCart ? 'Remove' : 'Add to cart'}</button>`;
}

const CART_SCRIPT = `
  <script>
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('.cart-button');
      if (!button) return;
      const id = Number(button.dataset.productId);
      const adding = button.textContent.trim() === 'Add to cart';
      button.disabled = true;
      const res = adding
        ? await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) })
        : await fetch('/api/cart/' + id, { method: 'DELETE' });
      const cart = await res.json();
      // A small delay so you can practise auto-waiting assertions.
      setTimeout(() => {
        document.querySelector('[data-testid="cart-count"]').textContent = String(cart.count);
        button.textContent = adding ? 'Remove' : 'Add to cart';
        button.disabled = false;
      }, 300);
    });
  </script>`;

function productsPage(req, user) {
  const cartIds = cartFor(user.username).items.map((i) => i.productId);
  return layout(
    req,
    'Products',
    `<h1>Products</h1>
    <p>Hello, ${escapeHtml(user.name)}! Pick something nice.</p>
    <div class="card">
      <input type="search" aria-label="Search products" placeholder="Search..." id="search">
      <select aria-label="Sort by" id="sort">
        <option value="az">Name (A to Z)</option>
        <option value="za">Name (Z to A)</option>
        <option value="lohi">Price (low to high)</option>
        <option value="hilo">Price (high to low)</option>
      </select>
      <span data-testid="result-count">${products.length} products</span>
    </div>
    <ul class="product-list" aria-label="Product list">
      ${products.map((p) => productCard(p, cartIds.includes(p.id))).join('\n      ')}
    </ul>
    <p id="no-results" class="error" hidden>No products match your search.</p>
    ${CART_SCRIPT}
    <script>
      const list = document.querySelector('.product-list');
      const cards = () => [...list.querySelectorAll('.product-card')];
      function apply() {
        const term = document.getElementById('search').value.trim().toLowerCase();
        const sort = document.getElementById('sort').value;
        const sorted = cards().sort((a, b) => {
          if (sort === 'az') return a.dataset.name.localeCompare(b.dataset.name);
          if (sort === 'za') return b.dataset.name.localeCompare(a.dataset.name);
          if (sort === 'lohi') return Number(a.dataset.price) - Number(b.dataset.price);
          return Number(b.dataset.price) - Number(a.dataset.price);
        });
        let visible = 0;
        for (const card of sorted) {
          list.appendChild(card);
          card.hidden = !card.dataset.name.toLowerCase().includes(term);
          if (!card.hidden) visible++;
        }
        document.querySelector('[data-testid="result-count"]').textContent = visible + ' products';
        document.getElementById('no-results').hidden = visible > 0;
      }
      document.getElementById('search').addEventListener('input', apply);
      document.getElementById('sort').addEventListener('change', apply);
    </script>`,
  );
}

function productDetailPage(req, user, p) {
  const inCart = cartFor(user.username).items.some((i) => i.productId === p.id);
  return layout(
    req,
    p.name,
    `<p><a href="/products">&larr; Back to products</a></p>
    <article class="card" data-testid="product-detail">
      <h1>${escapeHtml(p.name)}</h1>
      <p class="price">${money(p.price)}</p>
      <p>${escapeHtml(p.description ?? '')}</p>
      <p>Category: <strong>${escapeHtml(p.category ?? 'other')}</strong></p>
      ${cartButton(p, inCart)}
    </article>
    ${CART_SCRIPT}`,
  );
}

function cartPage(req, user) {
  const cart = cartFor(user.username);
  const rows = cart.items
    .map(
      (i) => `<tr data-testid="cart-row">
          <td>${escapeHtml(i.name)}</td>
          <td>${i.quantity}</td>
          <td>${money(i.price * i.quantity)}</td>
          <td><form method="post" action="/cart/remove"><input type="hidden" name="productId" value="${i.productId}"><button type="submit">Remove</button></form></td>
        </tr>`,
    )
    .join('\n        ');
  const body = cart.items.length
    ? `<table aria-label="Cart items">
        <thead><tr><th>Product</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr></thead>
        <tbody>
        ${rows}
        </tbody>
      </table>
      <p data-testid="cart-total"><strong>Total: ${money(cart.total)}</strong></p>
      <p><a href="/checkout">Checkout</a></p>`
    : '<p data-testid="empty-cart">Your cart is empty.</p>';
  return layout(req, 'Cart', `<h1>Your Cart</h1>\n    ${body}`);
}

function checkoutPage(req, { error = '', values = {} } = {}) {
  const v = (k) => escapeHtml(values[k] ?? '');
  return layout(
    req,
    'Checkout',
    `<h1>Checkout</h1>
    <form class="card" method="post" action="/checkout" style="max-width: 360px" novalidate>
      <label for="firstName">First name</label>
      <input id="firstName" name="firstName" value="${v('firstName')}">
      <label for="lastName">Last name</label>
      <input id="lastName" name="lastName" value="${v('lastName')}">
      <label for="postalCode">Postal code</label>
      <input id="postalCode" name="postalCode" value="${v('postalCode')}">
      <p><button type="submit">Place order</button></p>
      ${error ? `<p role="alert" class="error">${escapeHtml(error)}</p>` : ''}
    </form>`,
  );
}

function orderCompletePage(req, orderId) {
  return layout(
    req,
    'Order complete',
    `<h1>Thank you for your order!</h1>
    <p class="success">Your order number is <strong data-testid="order-number">${escapeHtml(orderId)}</strong>.</p>
    <p><a href="/products">Continue shopping</a></p>`,
  );
}

function adminPage(req) {
  const rows = users
    .map(
      (u) =>
        `<tr><td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.name)}</td><td>${u.role}</td><td>${u.locked ? 'Locked' : 'Active'}</td></tr>`,
    )
    .join('\n        ');
  return layout(
    req,
    'Admin',
    `<h1>Admin Dashboard</h1>
    <p>Products in store: <strong data-testid="product-total">${products.length}</strong></p>
    <table aria-label="Users">
      <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`,
  );
}

function forbiddenPage(req) {
  return layout(req, 'Access denied', '<h1>Access denied</h1><p class="error">You need to be an admin to see this page.</p>');
}

function notFoundPage(req) {
  return layout(req, 'Not found', '<h1>Page not found</h1><p>Nothing to see here. <a href="/">Go home</a></p>');
}

function playgroundPage(req) {
  return layout(
    req,
    'Playground',
    `<h1>Playground</h1>
    <p>Every kind of element you will meet in real apps. No login needed.</p>

    <section class="card" aria-labelledby="form-title">
      <h2 id="form-title">Sign-up form</h2>
      <form id="signup">
        <label for="fullName">Full name</label>
        <input id="fullName" name="fullName" placeholder="Jane Doe">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="jane@example.com">
        <label for="age">Age</label>
        <input id="age" name="age" type="number" min="0">
        <label for="country">Country</label>
        <select id="country" name="country">
          <option value="">Choose a country</option>
          <option value="br">Brazil</option>
          <option value="pt">Portugal</option>
          <option value="us">United States</option>
          <option value="jp">Japan</option>
        </select>
        <fieldset>
          <legend>Plan</legend>
          <label><input type="radio" name="plan" value="free" checked> Free</label>
          <label><input type="radio" name="plan" value="pro"> Pro</label>
          <label><input type="radio" name="plan" value="enterprise"> Enterprise</label>
        </fieldset>
        <label for="startDate">Start date</label>
        <input id="startDate" name="startDate" type="date">
        <label for="comments">Comments</label>
        <textarea id="comments" name="comments" rows="3"></textarea>
        <label><input type="checkbox" name="newsletter"> Send me the newsletter</label>
        <label><input type="checkbox" name="terms"> I agree to the terms</label>
        <p><button type="submit">Submit</button></p>
        <p role="alert" class="error" id="form-error" hidden></p>
      </form>
      <pre data-testid="form-result" hidden></pre>
    </section>

    <section class="card" aria-labelledby="waiting-title">
      <h2 id="waiting-title">Waiting</h2>
      <button id="slow-button">Show message</button>
      <p data-testid="slow-message" hidden>Loaded after a delay!</p>
      <p>
        <button id="toggle-button" aria-expanded="false">Toggle details</button>
      </p>
      <p id="details" hidden>These are the secret details.</p>
      <p>
        <button id="progress-button">Start download</button>
        <span data-testid="progress-status">Idle</span>
      </p>
    </section>

    <section class="card" aria-labelledby="counter-title">
      <h2 id="counter-title">Counter</h2>
      <button id="decrement">Decrement</button>
      <output data-testid="counter" aria-label="Counter value">0</output>
      <button id="increment">Increment</button>
    </section>

    <section class="card" aria-labelledby="todo-title">
      <h2 id="todo-title">To-do list</h2>
      <label for="new-todo">New to-do</label>
      <input id="new-todo" placeholder="What needs to be done?">
      <button id="add-todo">Add</button>
      <ul aria-label="To-do items" id="todo-list"></ul>
      <p data-testid="todo-count">0 items</p>
    </section>

    <section class="card" aria-labelledby="dialog-title">
      <h2 id="dialog-title">Dialogs</h2>
      <button id="alert-button">Open alert</button>
      <button id="confirm-button">Open confirm</button>
      <button id="prompt-button">Open prompt</button>
      <p data-testid="dialog-result"></p>
    </section>

    <section class="card" aria-labelledby="table-title">
      <h2 id="table-title">Employees</h2>
      <table aria-label="Employees">
        <thead><tr><th>Name</th><th>Department</th><th>Salary</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Alice Martins</td><td>QA</td><td>5200</td><td><button>Edit</button></td></tr>
          <tr><td>Bruno Costa</td><td>QA</td><td>4800</td><td><button>Edit</button></td></tr>
          <tr><td>Carla Souza</td><td>Development</td><td>6100</td><td><button>Edit</button></td></tr>
          <tr><td>Diego Lima</td><td>Design</td><td>4500</td><td><button>Edit</button></td></tr>
          <tr><td>Eva Rocha</td><td>Development</td><td>7000</td><td><button>Edit</button></td></tr>
        </tbody>
      </table>
      <p data-testid="table-result"></p>
    </section>

    <section class="card" aria-labelledby="misc-title">
      <h2 id="misc-title">Odds and ends</h2>
      <p>
        <label><input type="checkbox" id="enable-checkbox"> Enable the button</label>
        <button id="locked-button" disabled>Locked button</button>
        <span data-testid="locked-result"></span>
      </p>
      <p>
        <button id="hover-target">Hover me</button>
        <span class="tooltip" role="tooltip" hidden>You found the tooltip!</span>
      </p>
      <p>
        <label for="upload">Upload file</label>
        <input id="upload" type="file">
        <span data-testid="upload-result">No file selected</span>
      </p>
      <p>
        <img alt="QA Shop logo" width="32" height="32" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%231d2330'/%3E%3Ctext x='16' y='21' font-size='12' text-anchor='middle' fill='white'%3EQA%3C/text%3E%3C/svg%3E">
        <span title="Free shipping on orders over $50">🚚 Shipping info</span>
      </p>
      <p>
        <a href="/products" target="_blank" id="new-tab-link">Open products in a new tab</a>
      </p>
      <p>
        <button id="load-products">Load products</button>
        <span data-testid="load-status"></span>
      </p>
      <ul aria-label="Loaded products" data-testid="loaded-products"></ul>
    </section>

    <script>
      const $ = (sel) => document.querySelector(sel);

      // Sign-up form: validates and prints the result as JSON.
      $('#signup').addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.target));
        const error = $('#form-error');
        const result = $('[data-testid="form-result"]');
        if (!data.fullName) { error.textContent = 'Full name is required'; error.hidden = false; result.hidden = true; return; }
        if (!data.email || !data.email.includes('@')) { error.textContent = 'Please enter a valid email'; error.hidden = false; result.hidden = true; return; }
        if (!data.terms) { error.textContent = 'You must agree to the terms'; error.hidden = false; result.hidden = true; return; }
        error.hidden = true;
        data.newsletter = Boolean(data.newsletter);
        data.terms = true;
        result.textContent = JSON.stringify(data, null, 2);
        result.hidden = false;
      });

      // Waiting
      $('#slow-button').addEventListener('click', () => {
        setTimeout(() => { $('[data-testid="slow-message"]').hidden = false; }, 2000);
      });
      $('#toggle-button').addEventListener('click', (e) => {
        const details = $('#details');
        details.hidden = !details.hidden;
        e.target.setAttribute('aria-expanded', String(!details.hidden));
      });
      $('#progress-button').addEventListener('click', () => {
        const status = $('[data-testid="progress-status"]');
        status.textContent = 'Downloading...';
        setTimeout(() => { status.textContent = '50%'; }, 700);
        setTimeout(() => { status.textContent = 'Complete!'; }, 1500);
      });

      // Counter
      let count = 0;
      const counter = $('[data-testid="counter"]');
      $('#increment').addEventListener('click', () => { counter.textContent = String(++count); });
      $('#decrement').addEventListener('click', () => { counter.textContent = String(--count); });

      // To-do list
      function updateTodoCount() {
        const n = document.querySelectorAll('#todo-list li').length;
        $('[data-testid="todo-count"]').textContent = n + (n === 1 ? ' item' : ' items');
      }
      function addTodo() {
        const input = $('#new-todo');
        const text = input.value.trim();
        if (!text) return;
        const li = document.createElement('li');
        li.innerHTML = '<span></span> <button>Delete</button>';
        li.querySelector('span').textContent = text;
        li.querySelector('button').setAttribute('aria-label', 'Delete ' + text);
        li.querySelector('button').addEventListener('click', () => { li.remove(); updateTodoCount(); });
        $('#todo-list').appendChild(li);
        input.value = '';
        updateTodoCount();
      }
      $('#add-todo').addEventListener('click', addTodo);
      $('#new-todo').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });

      // Dialogs
      const dialogResult = $('[data-testid="dialog-result"]');
      $('#alert-button').addEventListener('click', () => { alert('Hello from an alert!'); dialogResult.textContent = 'Alert closed'; });
      $('#confirm-button').addEventListener('click', () => {
        dialogResult.textContent = confirm('Are you sure?') ? 'You clicked: OK' : 'You clicked: Cancel';
      });
      $('#prompt-button').addEventListener('click', () => {
        const name = prompt('What is your name?');
        dialogResult.textContent = name ? 'Hello, ' + name + '!' : 'No name given';
      });

      // Table
      document.querySelectorAll('table[aria-label="Employees"] button').forEach((button) => {
        button.addEventListener('click', () => {
          const name = button.closest('tr').querySelector('td').textContent;
          $('[data-testid="table-result"]').textContent = 'Editing ' + name;
        });
      });

      // Odds and ends
      $('#enable-checkbox').addEventListener('change', (e) => { $('#locked-button').disabled = !e.target.checked; });
      $('#locked-button').addEventListener('click', () => { $('[data-testid="locked-result"]').textContent = 'Unlocked!'; });
      const tooltip = $('[role="tooltip"]');
      $('#hover-target').addEventListener('mouseenter', () => { tooltip.hidden = false; });
      $('#hover-target').addEventListener('mouseleave', () => { tooltip.hidden = true; });
      $('#upload').addEventListener('change', (e) => {
        const names = [...e.target.files].map((f) => f.name).join(', ');
        $('[data-testid="upload-result"]').textContent = names ? 'Selected: ' + names : 'No file selected';
      });
      $('#load-products').addEventListener('click', async () => {
        const status = $('[data-testid="load-status"]');
        const list = $('[data-testid="loaded-products"]');
        status.textContent = 'Loading...';
        list.innerHTML = '';
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const items = await res.json();
          for (const p of items) {
            const li = document.createElement('li');
            li.textContent = p.name + ' - $' + Number(p.price).toFixed(2);
            list.appendChild(li);
          }
          status.textContent = 'Loaded ' + items.length + ' products';
        } catch (err) {
          status.textContent = 'Failed to load products';
        }
      });
    </script>`,
  );
}

// ---------------------------------------------------------------------------
// API routes (/api/...)
// ---------------------------------------------------------------------------
async function handleApi(req, res, url) {
  const delay = Math.min(Number(url.searchParams.get('delay') ?? 0) || 0, 5000);
  if (delay > 0) await sleep(delay);

  const path = url.pathname;
  const method = req.method;
  const user = currentUser(req);
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(req) : {};
  if (body.__invalidJson) return json(res, 400, { error: 'Invalid JSON body' });

  const requireUser = () => {
    if (!user) {
      json(res, 401, { error: 'Unauthorized' });
      return false;
    }
    return true;
  };
  const requireAdmin = () => {
    if (!requireUser()) return false;
    if (user.role !== 'admin') {
      json(res, 403, { error: 'Forbidden' });
      return false;
    }
    return true;
  };

  if (path === '/api/health' && method === 'GET') return json(res, 200, { status: 'ok' });

  if (path === '/api/reset' && method === 'POST') {
    resetData();
    return json(res, 200, { ok: true });
  }

  if (path === '/api/login' && method === 'POST') {
    if (!body.username || !body.password) return json(res, 400, { error: 'username and password are required' });
    const found = users.find((u) => u.username === body.username && u.password === body.password);
    if (!found) return json(res, 401, { error: 'Invalid username or password' });
    if (found.locked) return json(res, 403, { error: 'User is locked' });
    return json(res, 200, { token: createSession(found.username), user: publicUser(found) });
  }

  if (path === '/api/me' && method === 'GET') {
    if (!requireUser()) return;
    return json(res, 200, publicUser(user));
  }

  if (path === '/api/users' && method === 'POST') {
    const { username, password, name } = body;
    if (typeof username !== 'string' || username.length < 3) return json(res, 400, { error: 'username must have at least 3 characters' });
    if (typeof password !== 'string' || password.length < 6) return json(res, 400, { error: 'password must have at least 6 characters' });
    if (users.some((u) => u.username === username)) return json(res, 409, { error: 'username already exists' });
    const created = { username, password, name: typeof name === 'string' && name ? name : username, role: 'user', locked: false };
    users.push(created);
    return json(res, 201, publicUser(created));
  }

  if (path === '/api/products' && method === 'GET') {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();
    let list = products;
    if (category) list = list.filter((p) => p.category === category);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search));
    return json(res, 200, list);
  }

  if (path === '/api/products' && method === 'POST') {
    if (!requireAdmin()) return;
    const error = validateProduct(body, false);
    if (error) return json(res, 400, { error });
    const product = {
      id: nextProductId++,
      name: body.name.trim(),
      price: body.price,
      category: typeof body.category === 'string' ? body.category : 'other',
      stock: body.stock ?? 10,
      description: typeof body.description === 'string' ? body.description : '',
    };
    products.push(product);
    return json(res, 201, product);
  }

  const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch) {
    const id = Number(productMatch[1]);
    const product = products.find((p) => p.id === id);
    if (method === 'GET') {
      return product ? json(res, 200, product) : json(res, 404, { error: 'Product not found' });
    }
    if (method === 'PUT' || method === 'PATCH') {
      if (!requireAdmin()) return;
      if (!product) return json(res, 404, { error: 'Product not found' });
      const error = validateProduct(body, true);
      if (error) return json(res, 400, { error });
      for (const key of ['name', 'price', 'category', 'stock', 'description']) {
        if (key in body) product[key] = body[key];
      }
      return json(res, 200, product);
    }
    if (method === 'DELETE') {
      if (!requireAdmin()) return;
      if (!product) return json(res, 404, { error: 'Product not found' });
      products = products.filter((p) => p.id !== id);
      return send(res, 204, '');
    }
  }

  if (path === '/api/cart') {
    if (!requireUser()) return;
    if (method === 'GET') return json(res, 200, cartFor(user.username));
    if (method === 'POST') {
      const productId = Number(body.productId);
      const quantity = body.quantity === undefined ? 1 : Number(body.quantity);
      const product = products.find((p) => p.id === productId);
      if (!product) return json(res, 404, { error: 'Product not found' });
      if (!Number.isInteger(quantity) || quantity < 1) return json(res, 400, { error: 'quantity must be a whole number >= 1' });
      if (product.stock === 0) return json(res, 409, { error: 'Product is out of stock' });
      const items = carts.get(user.username) ?? [];
      const existing = items.find((i) => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else items.push({ productId, quantity });
      carts.set(user.username, items);
      return json(res, 201, cartFor(user.username));
    }
    if (method === 'DELETE') {
      carts.set(user.username, []);
      return json(res, 200, cartFor(user.username));
    }
  }

  const cartItemMatch = path.match(/^\/api\/cart\/([^/]+)$/);
  if (cartItemMatch && method === 'DELETE') {
    if (!requireUser()) return;
    const productId = Number(cartItemMatch[1]);
    const items = carts.get(user.username) ?? [];
    if (!items.some((i) => i.productId === productId)) return json(res, 404, { error: 'Product not in cart' });
    carts.set(user.username, items.filter((i) => i.productId !== productId));
    return json(res, 200, cartFor(user.username));
  }

  return json(res, 404, { error: 'Not found' });
}

// ---------------------------------------------------------------------------
// Page routes
// ---------------------------------------------------------------------------
async function handlePage(req, res, url) {
  const path = url.pathname;
  const method = req.method;
  const user = currentUser(req);
  const mustLogin = () => redirect(res, `/login?next=${encodeURIComponent(path)}`);

  if (path === '/' && method === 'GET') return html(res, 200, homePage(req));

  if (path === '/login' && method === 'GET') {
    return html(res, 200, loginPage(req, { next: url.searchParams.get('next') ?? '' }));
  }

  if (path === '/login' && method === 'POST') {
    const body = await readBody(req);
    const next = typeof body.next === 'string' && body.next.startsWith('/') ? body.next : '/products';
    const found = users.find((u) => u.username === body.username && u.password === body.password);
    if (!body.username) return html(res, 400, loginPage(req, { error: 'Username is required', next }));
    if (!body.password) return html(res, 400, loginPage(req, { error: 'Password is required', username: body.username, next }));
    if (!found) return html(res, 401, loginPage(req, { error: 'Invalid username or password', username: body.username, next }));
    if (found.locked) {
      return html(res, 403, loginPage(req, { error: 'Sorry, this user has been locked out.', username: body.username, next }));
    }
    const token = createSession(found.username);
    return redirect(res, next, { 'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax` });
  }

  if (path === '/logout') {
    const token = parseCookies(req).session;
    if (token) sessions.delete(token);
    return redirect(res, '/login', { 'Set-Cookie': 'session=; Path=/; Max-Age=0' });
  }

  if (path === '/playground' && method === 'GET') return html(res, 200, playgroundPage(req));

  if (path === '/products' && method === 'GET') {
    if (!user) return mustLogin();
    return html(res, 200, productsPage(req, user));
  }

  const productMatch = path.match(/^\/products\/(\d+)$/);
  if (productMatch && method === 'GET') {
    if (!user) return mustLogin();
    const product = products.find((p) => p.id === Number(productMatch[1]));
    return product ? html(res, 200, productDetailPage(req, user, product)) : html(res, 404, notFoundPage(req));
  }

  if (path === '/cart' && method === 'GET') {
    if (!user) return mustLogin();
    return html(res, 200, cartPage(req, user));
  }

  if (path === '/cart/remove' && method === 'POST') {
    if (!user) return mustLogin();
    const body = await readBody(req);
    const items = carts.get(user.username) ?? [];
    carts.set(user.username, items.filter((i) => i.productId !== Number(body.productId)));
    return redirect(res, '/cart');
  }

  if (path === '/checkout' && method === 'GET') {
    if (!user) return mustLogin();
    return html(res, 200, checkoutPage(req));
  }

  if (path === '/checkout' && method === 'POST') {
    if (!user) return mustLogin();
    const body = await readBody(req);
    const missing = [
      ['firstName', 'First name is required'],
      ['lastName', 'Last name is required'],
      ['postalCode', 'Postal code is required'],
    ].find(([key]) => !String(body[key] ?? '').trim());
    if (missing) return html(res, 400, checkoutPage(req, { error: missing[1], values: body }));
    if (cartFor(user.username).items.length === 0) {
      return html(res, 400, checkoutPage(req, { error: 'Your cart is empty', values: body }));
    }
    carts.set(user.username, []);
    return redirect(res, `/checkout/complete?order=ORD-${++orderCounter}`);
  }

  if (path === '/checkout/complete' && method === 'GET') {
    if (!user) return mustLogin();
    return html(res, 200, orderCompletePage(req, url.searchParams.get('order') ?? 'unknown'));
  }

  if (path === '/admin' && method === 'GET') {
    if (!user) return mustLogin();
    if (user.role !== 'admin') return html(res, 403, forbiddenPage(req));
    return html(res, 200, adminPage(req));
  }

  return html(res, 404, notFoundPage(req));
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else await handlePage(req, res, url);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) json(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`QA Shop running at http://localhost:${PORT}`);
});
