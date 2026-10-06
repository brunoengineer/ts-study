# QA Shop: the practice app

A small web shop with a REST API that runs on your machine. All the Playwright exercises test against it.

```bash
npm run app          # start it yourself -> http://localhost:3000
```

You usually don't need to start it: Playwright starts it automatically before the tests (`webServer` in `playwright.config.ts`).
Open it in your browser while you study, and use DevTools (F12) to inspect elements.

Data lives in memory. Restarting the app, or calling `POST /api/reset`, puts everything back to the defaults below.

## Users

| Username | Password | Name | Role | Notes |
|---|---|---|---|---|
| `standard_user` | `secret123` | Sam Standard | user | |
| `admin` | `admin123` | Ada Admin | admin | can open `/admin` and create/update/delete products |
| `locked_user` | `secret123` | Lou Locked | user | login fails: locked out |

## Products (default)

| id | name | price | category | stock |
|---|---|---|---|---|
| 1 | Backpack | 29.99 | bags | 10 |
| 2 | Bike Light | 9.99 | accessories | 25 |
| 3 | Bolt T-Shirt | 15.99 | clothes | 40 |
| 4 | Fleece Jacket | 49.99 | clothes | 5 |
| 5 | Onesie | 7.99 | clothes | 0 (sold out) |
| 6 | Red T-Shirt | 15.99 | clothes | 12 |

## Pages

Every page has a header with `nav` (accessible name **"Main"**) containing links: **Home**, **Products**, **Cart (N)**
(the number is in `data-testid="cart-count"`), **Playground**, **Admin** (admins only), and either **Log in** or
the user's name (`data-testid="user-name"`) plus **Log out**.

| URL | Login? | What's there |
|---|---|---|
| `/` | no | heading "Welcome to QA Shop", list of test accounts |
| `/login` | no | heading "Login"; textboxes labelled **Username** and **Password**; button **Log in**. Errors appear in `role="alert"` (`data-testid="login-error"`): "Invalid username or password", "Username is required", "Password is required", "Sorry, this user has been locked out." Success redirects to `/products` (or to `?next=`). |
| `/logout` | | logs out, redirects to `/login` |
| `/products` | yes | heading "Products"; text "Hello, {name}!"; searchbox **"Search products"** (filters as you type); combobox **"Sort by"** with options `az` "Name (A to Z)", `za`, `lohi` "Price (low to high)", `hilo`; `data-testid="result-count"` ("6 products"); list **"Product list"** of `li` cards (`data-testid="product-card"`) each with a heading (`h2`) name, `.price` "$29.99", stock text, link **Details**, and button **Add to cart** (it becomes **Remove** after ~300 ms; sold out shows a disabled **Sold out** button). If nothing matches the search: "No products match your search." |
| `/products/:id` | yes | `data-testid="product-detail"`, heading (h1) with the product name, price, description, "Category: x", Add to cart / Remove button, link "← Back to products" |
| `/cart` | yes | heading "Your Cart"; table **"Cart items"** with rows `data-testid="cart-row"` (Product, Quantity, Subtotal, **Remove** button); `data-testid="cart-total"` "Total: $59.98"; link **Checkout**. Empty: `data-testid="empty-cart"` "Your cart is empty." |
| `/checkout` | yes | heading "Checkout"; textboxes **First name**, **Last name**, **Postal code**; button **Place order**. Errors in `role="alert"`: "First name is required" / "Last name is required" / "Postal code is required" / "Your cart is empty". |
| `/checkout/complete` | yes | heading "Thank you for your order!"; `data-testid="order-number"` like `ORD-1001` |
| `/admin` | admin | heading "Admin Dashboard"; `data-testid="product-total"`; table **"Users"**. Non-admins get status 403 with heading "Access denied". |
| `/playground` | no | see below |
| anything else | | 404, heading "Page not found" |

Pages that need a login redirect to `/login?next=/the/page` when you're logged out.

### `/playground`: every kind of element

| Section (heading) | Elements |
|---|---|
| **Sign-up form** | textboxes **Full name** (placeholder "Jane Doe"), **Email**, spinbutton **Age**, combobox **Country** (options: "Choose a country" `''`, Brazil `br`, Portugal `pt`, United States `us`, Japan `jp`), radio group "Plan": **Free** (checked), **Pro**, **Enterprise**; date input **Start date**; textbox **Comments** (textarea); checkboxes **Send me the newsletter** and **I agree to the terms**; button **Submit**. Validation errors in `role="alert"`: "Full name is required", "Please enter a valid email", "You must agree to the terms". On success `data-testid="form-result"` shows the data as JSON. |
| **Waiting** | button **Show message**: after **2 seconds** shows `data-testid="slow-message"` "Loaded after a delay!". Button **Toggle details** (`aria-expanded`) shows/hides "These are the secret details.". Button **Start download** → `data-testid="progress-status"` goes "Idle" → "Downloading..." → "50%" → "Complete!" (~1.5 s). |
| **Counter** | buttons **Decrement** / **Increment**; `data-testid="counter"` (an `output`) starts at "0". |
| **To-do list** | textbox **New to-do** (placeholder "What needs to be done?"), button **Add** (Enter also adds); list **"To-do items"**; each item has a button **"Delete {text}"**; `data-testid="todo-count"` "0 items" / "1 item" / "2 items". |
| **Dialogs** | **Open alert** (message "Hello from an alert!", then result "Alert closed"), **Open confirm** ("Are you sure?" → "You clicked: OK" / "You clicked: Cancel"), **Open prompt** ("What is your name?" → "Hello, {name}!" / "No name given"). Result in `data-testid="dialog-result"`. |
| **Employees** | table **"Employees"**, columns Name / Department / Salary / Action. Rows: Alice Martins QA 5200; Bruno Costa QA 4800; Carla Souza Development 6100; Diego Lima Design 4500; Eva Rocha Development 7000. Each row has an **Edit** button → `data-testid="table-result"` "Editing {name}". |
| **Odds and ends** | checkbox **Enable the button** enables button **Locked button** (disabled at first) → `data-testid="locked-result"` "Unlocked!". Button **Hover me** shows a `role="tooltip"` "You found the tooltip!" while hovered. File input **Upload file** → `data-testid="upload-result"` "Selected: name.txt" (default "No file selected"). An image with alt text **"QA Shop logo"** (`getByAltText`) and a span with title **"Free shipping on orders over $50"** (`getByTitle`). Link **Open products in a new tab** (`target="_blank"`). Button **Load products** → fetches `GET /api/products`, `data-testid="load-status"` "Loading..." → "Loaded 6 products" (or "Failed to load products" if the request fails), list **"Loaded products"** (`data-testid="loaded-products"`) with items like "Backpack - $29.99". |

## REST API

Base URL: `http://localhost:3000`. Bodies are JSON. Auth: header `Authorization: Bearer <token>` (token from `/api/login`).
The browser session cookie (`session`) also works, so a logged-in page can call the API too.
Add `?delay=1000` to any API call to make it slower (max 5000 ms). Handy for practising waits.

| Method & path | Auth | Body | Responses |
|---|---|---|---|
| `GET /api/health` | | | 200 `{ "status": "ok" }` |
| `POST /api/reset` | | | 200 `{ "ok": true }`: restores default users, products and carts |
| `POST /api/login` | | `{ username, password }` | 200 `{ token, user: { username, name, role } }` · 400 missing fields · 401 `{ error: "Invalid username or password" }` · 403 `{ error: "User is locked" }` |
| `GET /api/me` | user | | 200 `{ username, name, role }` · 401 `{ error: "Unauthorized" }` |
| `POST /api/users` | | `{ username, password, name? }` | 201 `{ username, name, role: "user" }` · 400 (username < 3 chars or password < 6 chars) · 409 `{ error: "username already exists" }` |
| `GET /api/products` | | query: `?category=clothes`, `?search=shirt` | 200 `Product[]` |
| `GET /api/products/:id` | | | 200 `Product` · 404 `{ error: "Product not found" }` |
| `POST /api/products` | admin | `{ name, price, category?, description?, stock? }` | 201 `Product` (new id, default stock 10, category "other") · 400 `{ error: "name is required" }` / `"price must be a positive number"` · 401 · 403 `{ error: "Forbidden" }` |
| `PUT` or `PATCH /api/products/:id` | admin | any of the fields | 200 `Product` · 400 · 401 · 403 · 404 |
| `DELETE /api/products/:id` | admin | | 204 (no body) · 401 · 403 · 404 |
| `GET /api/cart` | user | | 200 `{ items: [{ productId, name, price, quantity }], total, count }` |
| `POST /api/cart` | user | `{ productId, quantity? }` | 201 cart · 400 bad quantity · 404 unknown product · 409 out of stock |
| `DELETE /api/cart/:productId` | user | | 200 cart · 404 `{ error: "Product not in cart" }` |
| `DELETE /api/cart` | user | | 200 empty cart |

`Product` = `{ id: number, name: string, price: number, category: string, stock: number, description: string }`

Carts belong to a **user**, not to a session. Two tests logged in as `standard_user` share the same cart.
That's why many tests call `POST /api/reset` first, or create a fresh user with `POST /api/users`.
