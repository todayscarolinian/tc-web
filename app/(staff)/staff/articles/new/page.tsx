import { ArticleEditor } from "@/components/staff/article-editor";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";
export default async function StaffNewArticlePage() {
  const session = await sessionService.getCurrentStaffSession();
  
  return <ArticleEditor currentUserId={session?.userId ?? null} />;
}
