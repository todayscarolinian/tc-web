import { SITE_URL } from "@/src/lib/site";
import { PUBLICATION } from "@/src/entities/publication/infrastructure/publication.composition";
import { articleService } from "@/src/entities/article/services/article.service.factory";

export const revalidate = 3600;

const FEED_SIZE = 20;
const SITE_NAME = "Today's Carolinian";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await articleService.listPublished();

  const items = articles
    .filter((article) => article.publishedAt !== null)
    .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime())
    .slice(0, FEED_SIZE)
    .map((article) => {
      const link = `${SITE_URL}/article/${article.slug}`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${article.publishedAt!.toUTCString()}</pubDate>
      <description>${escapeXml(article.dek)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(PUBLICATION.bio)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
