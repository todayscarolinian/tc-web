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

  return [{ url: SITE_URL }, ...sectionEntries, ...articleEntries];
}
