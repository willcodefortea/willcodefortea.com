#!/usr/bin/env node
// One-shot conversion of Jekyll/Liquid syntax in migrated markdown files
// to Astro/MDX equivalents. Run from repo root.
//
// Transforms:
//   {% include figure image_path="..." alt="..." caption="..." %}{: .img-zoom}
//   {% include figure image_path="..." alt="..." caption="..." %}
//     -> <Figure src="..." alt="..." caption="..." />
//   {% include image-zoom.html %}
//     -> (removed; PostLayout always mounts the zoom script)
//
// Files that gain a <Figure> tag are renamed .md -> .mdx and gain an import
// of the global ~/components/Figure.astro at the top of the body.

import { readdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const ROOTS = ['src/content/what_is', 'src/content/blog'];

const FIGURE_RE =
  /\{%\s*include\s+figure\s+([\s\S]*?)\s*%\}(\{:\s*\.[a-z-]+\s*\})?/g;
const ZOOM_INCLUDE_RE = /\{%\s*include\s+image-zoom\.html\s*%\}\s*/g;

function parseAttrs(raw) {
  const attrs = {};
  const re = /(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(raw))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function escapeAttr(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function convert(content) {
  let usedFigure = false;
  let next = content.replace(FIGURE_RE, (_match, body) => {
    const attrs = parseAttrs(body);
    const src = attrs.image_path ?? attrs.url ?? '';
    const alt = attrs.alt ?? '';
    const caption = attrs.caption ?? '';
    usedFigure = true;
    const parts = [`src="${escapeAttr(src)}"`, `alt="${escapeAttr(alt)}"`];
    if (caption) parts.push(`caption="${escapeAttr(caption)}"`);
    return `<Figure ${parts.join(' ')} />`;
  });
  next = next.replace(ZOOM_INCLUDE_RE, '');
  return { content: next, usedFigure };
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else yield fullPath;
  }
}

async function main() {
  let touched = 0;
  let renamed = 0;
  for (const root of ROOTS) {
    for await (const file of walk(root)) {
      if (!file.endsWith('.md')) continue;
      const source = await readFile(file, 'utf8');
      const { content, usedFigure } = convert(source);
      if (content === source) continue;
      const targetPath = usedFigure ? file.replace(/\.md$/, '.mdx') : file;
      let body = content;
      if (usedFigure) {
        body = ensureImport(body);
      }
      await writeFile(targetPath, body);
      if (targetPath !== file) {
        await rename(file, file).catch(() => {});
        // unlink the .md original since we wrote .mdx
        const { unlink } = await import('node:fs/promises');
        await unlink(file);
        renamed++;
      }
      touched++;
      console.log(`  ${path.relative(process.cwd(), file)} -> ${path.relative(process.cwd(), targetPath)}`);
    }
  }
  console.log(`\nConverted ${touched} file(s), renamed ${renamed} to .mdx.`);
}

function ensureImport(body) {
  // Insert import after the closing --- of frontmatter
  const fmEnd = body.indexOf('\n---', body.indexOf('---') + 3);
  if (fmEnd === -1) return body;
  const afterFm = fmEnd + 4;
  const importLine = `\nimport Figure from '~/components/Figure.astro';\n`;
  return body.slice(0, afterFm) + importLine + body.slice(afterFm);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
