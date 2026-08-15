import { NextRequest, NextResponse } from "next/server";
import { articleService } from "@/src/infrastructure/article/article.composition";
import type { ArticleInput } from "@/src/domain/article/article.entity";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";
// Demonstrates exposing the same use-case an internal page uses, over HTTP,
// for a future external/mobile/decoupled-frontend consumer.
export async function GET() {
  const articles = await articleService.listPublished();
  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const session = await sessionService.getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ArticleInput;
  const input = { ...body, authorId: session.userId };

  console.log("INPUT: ", input);

  const article = await articleService.staff.save(input);
  return NextResponse.json({ article }, { status: 201 });
}
