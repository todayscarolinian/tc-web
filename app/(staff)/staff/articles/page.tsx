import { ArticlesView } from "@/components/staff/articles-view";
import { articleService } from "@/src/entities/article/services/article.service.factory";

export default async function StaffArticlesPage() {
  const articles = await articleService.staff.listAll();
  
  return <ArticlesView initialArticles={articles} />;
}
