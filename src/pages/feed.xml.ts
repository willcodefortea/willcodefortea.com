import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { dateFromEntry } from '~/content.config';

export async function GET(context: APIContext) {
  const [whatIs, blog] = await Promise.all([
    getCollection('what_is'),
    getCollection('blog'),
  ]);

  const items = [...whatIs, ...blog]
    .map((entry) => ({
      entry,
      date: entry.data.date ?? dateFromEntry(entry),
    }))
    .filter((p) => p.date)
    .sort((a, b) => b.date!.valueOf() - a.date!.valueOf())
    .slice(0, 10)
    .map(({ entry, date }) => ({
      title: entry.data.title,
      pubDate: date!,
      description: entry.data.excerpt ?? '',
      link: `/${entry.collection === 'what_is' ? 'what-is' : 'blog'}/${entry.id}/`,
    }));

  return rss({
    title: 'willcodefortea',
    description: 'A collection of things that I find interesting.',
    site: context.site!,
    items,
  });
}
