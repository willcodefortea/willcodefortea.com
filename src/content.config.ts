import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

const postSchema = z.object({
  title: z.string(),
  categories: z.union([z.string(), z.array(z.string())]).optional(),
  excerpt: z.string().optional(),
  starred: z.boolean().optional(),
  header: z
    .object({
      overlay_image: z.string().optional(),
      overlay_filter: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  date: z.coerce.date().optional(),
  modified: z.string().optional(),
});

function generateId({ entry }: { entry: string }) {
  const base = entry.replace(/\.(md|mdx)$/, '');
  const match = base.match(DATE_PREFIX);
  return match ? match[4] : base;
}

export const collections = {
  what_is: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './src/content/what_is',
      generateId,
    }),
    schema: postSchema,
  }),
  blog: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './src/content/blog',
      generateId,
    }),
    schema: postSchema,
  }),
};

export function dateFromEntry(entry: { id: string; filePath?: string }): Date | undefined {
  if (!entry.filePath) return undefined;
  const filename = entry.filePath.split('/').pop()!.replace(/\.(md|mdx)$/, '');
  const match = filename.match(DATE_PREFIX);
  if (!match) return undefined;
  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
}
