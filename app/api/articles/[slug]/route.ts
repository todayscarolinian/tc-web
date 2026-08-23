// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";
import type { ArticleInput } from "@/src/domain/article/article.entity";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await sessionService.getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const rawBody = await request.json();

  const input: ArticleInput = {
    ...rawBody,
    authorId: session.userId,
  };

  try {
    const article = await articleService.staff.update(slug, input);
    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 },
    );
  }
}
