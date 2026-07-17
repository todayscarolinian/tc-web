import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/staff/article-editor";
import { STAFF_ARTICLES, staffArticleById } from "@/lib/staff-data";

export function generateStaticParams() {
  return STAFF_ARTICLES.map((a) => ({ id: a.id }));
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
  const article = staffArticleById(id);
  if (!article) notFound();

  return <ArticleEditor article={article} />;
}
