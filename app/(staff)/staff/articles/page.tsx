import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ArticlesView } from "@/components/staff/articles-view";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { articleKeys } from "@/src/entities/article/query-keys";

export default async function StaffArticlesPage() {
  const queryClient = new QueryClient();

  await queryClient
    .query({
      queryKey: articleKeys.staffList(),
      queryFn: () => articleService.staff.listAll(),
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticlesView />
    </HydrationBoundary>
  );
}
