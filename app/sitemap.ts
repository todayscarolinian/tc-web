import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/site";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { SECTIONS } from "@/src/entities/section/infrastructure/static-section.repository";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await articleService.listPublished();

  const sectionEntries: MetadataRoute.Sitemap = SECTIONS.map((section) => ({
    url: `${SITE_URL}/section/${section.slug}`,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/article/${article.slug}`,
    lastModified: article.publishedAt ?? article.updatedAt,
  }));

  const topicLastModified = new Map<string, Date>();
  const authorLastModified = new Map<string, Date>();
  for (const article of articles) {
    const modified = article.publishedAt ?? article.updatedAt;
    for (const tagSlug of article.tagSlugs) {
      keepLatest(topicLastModified, tagSlug.toLocaleLowerCase(), modified);
    }
    keepLatest(authorLastModified, article.authorId, modified);
  }

  const topicEntries: MetadataRoute.Sitemap = Array.from(topicLastModified, ([tagSlug, lastModified]) => ({
    url: `${SITE_URL}/topic/${tagSlug}`,
    lastModified,
  }));

  const authorEntries: MetadataRoute.Sitemap = Array.from(authorLastModified, ([authorId, lastModified]) => ({
    url: `${SITE_URL}/author/${authorId}`,
    lastModified,
  }));

  return [
    { url: SITE_URL },
    ...sectionEntries,
    ...topicEntries,
    ...authorEntries,
    ...articleEntries,
  ];
}

function keepLatest(map: Map<string, Date>, key: string, date: Date) {
  const current = map.get(key);
  if (!current || date > current) map.set(key, date);
}
