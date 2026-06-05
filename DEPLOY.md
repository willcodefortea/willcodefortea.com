# Cloudflare Pages deployment

The site is built with Astro and emits a static `dist/` directory. Hosting via
Cloudflare Pages with a git-connected project — no Workers / SSR adapter
required.

## One-time setup

1. **Create the Pages project**
   - Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
   - Pick the `willcodefortea/willcodefortea.github.io` repo
   - Production branch: `master`

2. **Build settings**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
   - Environment variable: `NODE_VERSION=20`

3. **Verify the preview deploy**
   - Cloudflare will deploy to `<project>.pages.dev` first
   - Spot-check the key URLs (see Verification below) before touching DNS

4. **Add the custom domain**
   - Pages project → Custom domains → `Set up a custom domain`
   - Add `www.willcodefortea.com`
   - Cloudflare will tell you which CNAME / nameserver change to make at the
     current DNS provider — follow that exactly
   - Optionally also add the apex `willcodefortea.com` with a redirect to `www.`

5. **Disable GitHub Pages on the repo**
   - GitHub repo → Settings → Pages → Source = `None`
   - This is what actually "moves us off GitHub hosting" — the source stays on
     GitHub, but it no longer serves the site

6. **Remove the `CNAME` file from the repo** (it was a GitHub Pages directive
   and confuses Cloudflare). Done in Stage 6 of the migration cleanup.

## Verification checklist (run against the `*.pages.dev` URL before DNS cutover)

- [ ] `/` 302-redirects to `/about/`
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
- [ ] A bad URL renders the custom 404 page

## Local development

```sh
mise install   # picks up Node 20 from .mise.toml
npm install
npm run dev    # http://localhost:4321
npm run build  # produces dist/
```
