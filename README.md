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
