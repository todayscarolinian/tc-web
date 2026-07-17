import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/staff/article-editor";
import { articleService } from "@/src/infrastructure/article/article.composition";

export async function generateStaticParams() {
  const articles = await articleService.staff.listAll();
  return articles.map((a) => ({ id: a.slug }));
}

// The article list is exhaustively known at build time — an unlisted id is a
// genuine 404, not a candidate for on-demand rendering.
export const dynamicParams = false;

export default async function StaffArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await articleService.staff.getBySlug(id);
  if (!article) notFound();

  return <ArticleEditor article={article} />;
}
