# Cloudflare Workers deployment

The site is built with Astro to a static `dist/` directory and served by
**Cloudflare Workers + Static Assets**. (Cloudflare Pages is being wound down;
Workers Static Assets is the supported path forward.)

Pure static deploy — no Worker script, no SSR adapter. The Worker runtime just
serves files from `dist/` and honours `_redirects` / `_headers` at the edge.

Config lives in [`wrangler.jsonc`](./wrangler.jsonc).

## One-time setup

1. **Install + log in to wrangler**

   ```sh
   npm install
   npx wrangler login
   ```

   `wrangler login` opens a browser to authorise the CLI against your
   Cloudflare account.

2. **First deploy**

   ```sh
   npm run cf:deploy
   ```

   This runs `astro build` then `wrangler deploy`. The first deploy creates
   the Worker (named `willcodefortea` per `wrangler.jsonc`) and prints a
   `*.workers.dev` preview URL.

3. **Verify against the preview URL** (see Verification below) **before**
   adding the custom domain.

4. **Custom domain**

   - Cloudflare dashboard → Workers & Pages → `willcodefortea` → Settings →
     Domains & Routes → Add → Custom domain
   - Add `www.willcodefortea.com`
   - Cloudflare creates the DNS record automatically if the zone is on
     Cloudflare; otherwise it tells you the CNAME target to set at your
     current DNS provider
   - Optionally add the apex `willcodefortea.com` with a redirect rule

5. **Disable GitHub Pages**

   - GitHub repo → Settings → Pages → Source = `None`
   - Source code stays on GitHub, but it no longer serves the site.

## Day-to-day

```sh
npm run dev        # Astro dev server (http://localhost:4321)
npm run cf:dev     # Wrangler dev — serves dist/ through the local Workers runtime
npm run cf:deploy  # Build + deploy to Cloudflare
```

For automated deploys, add a GitHub Action that runs `npm run cf:deploy` with
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets — or enable
Cloudflare's Workers Builds (the Workers equivalent of the old Pages git
integration) from the Worker's Settings → Builds tab.

## Edge behavior

Configured via `wrangler.jsonc` `[assets]`:

- `html_handling: "auto-trailing-slash"` — requests to `/about/` serve
  `/about/index.html`. Astro's `trailingSlash: 'always'` produces those.
- `not_found_handling: "404-page"` — unmatched routes serve `/404.html` with
  a 404 status (the custom 404 from `src/pages/404.astro`).

Files in `public/` that are honoured at the edge:

- `_redirects` — currently sets `/` → `/about/` 302 at the edge before any
  file is served.
- `_headers` (not present, can be added) — for cache-control, CSP, etc.

## Verification checklist

Run against the `*.workers.dev` preview URL before adding the custom domain:

- [ ] `/` 302-redirects to `/about/` (check `_redirects` is being applied)
- [ ] `/about/`, `/what-is/`, `/books-that-might-be-worth-reading/` all 200
- [ ] A few post URLs (e.g. `/what-is/hexagonal-architecture/`,
  `/what-is/dependency-injection-vs-ioc/`, `/blog/engineering-creativity/`)
  all 200
- [ ] `/feed.xml` returns valid RSS XML
- [ ] `/sitemap-index.xml` is generated
- [ ] Images in posts load (spot-check one from `/what-is/c4-diagram/` and one
  from `/blog/engineering-creativity/`)
- [ ] Code blocks are syntax-highlighted
- [ ] Clicking a post image opens it in the medium-zoom overlay
- [ ] A bad URL renders the custom 404 page with 404 status
- [ ] After cutover: `curl -I https://www.willcodefortea.com/` returns
  `cf-ray` header
