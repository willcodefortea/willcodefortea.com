# willcodefortea.com

Personal site of Ben Emery. Built with [Astro](https://astro.build), styled
with Tailwind CSS, deployed to Cloudflare Pages.

## Local development

```sh
mise install   # installs Node 20
npm install
npm run dev    # http://localhost:4321
```

## Production build

```sh
npm run build
npm run preview
```

## Adding a post

Drop a markdown file in `src/content/what_is/` (or `src/content/blog/`).
Use the `YYYY-MM-DD-slug.md` filename convention — the date becomes the post
date and the slug becomes the URL (`/what-is/slug/`). Frontmatter shape:

```yaml
---
title: "Some Title"
excerpt: "One-paragraph summary used in archive and RSS."
starred: true   # optional, surfaces on /what-is/ as Starred
header:
  overlay_image: /assets/images/what-is/some-topic/cover.jpg
  overlay_filter: 0.6
---
```

Images go in `public/assets/images/…` — they're served at `/assets/images/…`.

If a post needs the `<Figure>` component, rename it to `.mdx` and add at the
top of the body:

```mdx
import Figure from '~/components/Figure.astro';
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Cloudflare Pages setup and the DNS cutover
checklist.
