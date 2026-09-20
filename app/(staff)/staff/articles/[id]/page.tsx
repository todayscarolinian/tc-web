import { notFound } from "next/navigation";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ArticleEditor } from "@/components/staff/article-editor";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";
import { articleKeys } from "@/src/entities/article/query-keys";
import type { Article } from "@/src/entities/article/core/article.domain";

export async function generateStaticParams() {
  const articles = await articleService.staff.listAll();
  return articles.map((a) => ({ id: a.slug }));
}

// The article list is exhaustively known at build time — an unlisted id is a
// genuine 404, not a candidate for on-demand rendering.
export const dynamicParams = true;

export default async function StaffArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient
    .query({
      queryKey: articleKeys.staffDetail(id),
      queryFn: () => articleService.staff.getBySlug(id),
    })
    .catch(() => {});
  const article = queryClient.getQueryData<Article | null>(articleKeys.staffDetail(id));

  const session = await sessionService.getCurrentStaffSession();

  if (!article) notFound();

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ArticleEditor article={article} currentUserId={session?.userId ?? null} />
    </HydrationBoundary>
  );
}
