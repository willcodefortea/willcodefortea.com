#!/usr/bin/env node
// Cleanup pass for migrated MDX content:
//   1. Strip dead inline <script> tags (MathJax loader/config, TSP_CONFIG).
//      MathJax CDN URL is defunct and TSP app is out of scope.
//   2. Escape `{` and `}` chars outside of code fences and JSX so MDX's JS
//      parser doesn't try to evaluate math expressions like `${m \over n}`.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOTS = ['src/content/what_is', 'src/content/blog'];

// Whole-line patterns matched against trimmed content; we drop any <script>
// block whose body matches one of these heuristics.
const SCRIPT_BLOCK_RE = /<script[\s\S]*?<\/script>\s*/g;
const SCRIPT_SELF_CLOSING_RE = /<script[^>]*\/>\s*/g;

function escapeBracesInTextLines(content) {
  const lines = content.split('\n');
  let inCode = false;
  let inJsx = false;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCode = !inCode;
        return line;
      }
      if (inCode) return line;
      // Don't touch import lines, frontmatter delimiters, or our own Figure JSX.
      if (trimmed.startsWith('import ')) return line;
      if (trimmed === '---') return line;
      if (trimmed.startsWith('<Figure ')) return line;
      if (trimmed.startsWith('<') && trimmed.endsWith('>')) return line;
      return line.replace(/\\?\{/g, '\\{').replace(/\\?\}/g, '\\}');
    })
    .join('\n');
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
  for (const root of ROOTS) {
    for await (const file of walk(root)) {
      if (!file.endsWith('.mdx')) continue;
      const source = await readFile(file, 'utf8');
      let next = source
        .replace(SCRIPT_BLOCK_RE, '')
        .replace(SCRIPT_SELF_CLOSING_RE, '');
      next = escapeBracesInTextLines(next);
      if (next === source) continue;
      await writeFile(file, next);
      touched++;
      console.log(`  cleaned ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`\nCleaned ${touched} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
