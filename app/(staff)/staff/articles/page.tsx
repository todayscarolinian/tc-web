import { ArticlesView } from "@/components/staff/articles-view";
import { articleService } from "@/src/infrastructure/article/article.composition";

export default async function StaffArticlesPage() {
  const articles = await articleService.staff.listAll();
  
  return <ArticlesView initialArticles={articles} />;
}
