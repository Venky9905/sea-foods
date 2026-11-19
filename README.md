# Sea Foods

A React seafood shopping app for browsing products, managing a cart, placing orders, and viewing orders and inventory in a dashboard.

## Local development

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Deploying to Vercel

Import this repository into Vercel. Vercel will detect Vite and use the `build` script to create the production site in `dist`. The included `vercel.json` rewrites app routes to `index.html`, so routes such as `/Dashboard` also work when opened directly or refreshed.

## Authentication API

Guest browsing and basket building are available without an authentication API. Checkout stays gated until login returns an unexpired JWT and customer object; the client never creates a local or unsigned token.

The frontend expects `POST /login` and `POST /register` beneath `/api/auth`. Set `VITE_AUTH_API_BASE_URL` to use a different API base URL. A successful login response must contain `{ "token": "<signed JWT>", "customer": { ... } }`; the JWT must include an `exp` claim. Registration may return `{ "customer": { ... } }`.

JWT expiry checking in the browser is only a user-experience guard. The backend must verify the token signature and expiry on every protected order or account request. Order placement is currently stored in browser local storage and is not server-protected.
