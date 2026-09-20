import { NextResponse } from "next/server";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";

export async function GET() {
  const session = await sessionService.getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await articleService.staff.listAll();
  return NextResponse.json({ articles });
}
