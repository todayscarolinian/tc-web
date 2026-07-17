import { ArticlesView } from "@/components/staff/articles-view";
import { STAFF_ARTICLES } from "@/lib/staff-data";

export default function StaffArticlesPage() {
  return <ArticlesView initialArticles={STAFF_ARTICLES} />;
}
