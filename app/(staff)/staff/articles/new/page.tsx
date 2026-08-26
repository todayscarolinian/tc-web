import { ArticleEditor } from "@/components/staff/article-editor";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";
export default async function StaffNewArticlePage() {
  const session = await sessionService.getCurrentStaffSession();
  
  return <ArticleEditor currentUserId={session?.userId ?? null} />;
}
