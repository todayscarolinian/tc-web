import { NextRequest, NextResponse } from "next/server";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import type { ArticleInput } from "@/src/entities/article/core/article.domain";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";
import { getEligibleHeraldUsers, isEligibleAuthor } from "@/src/lib/herald/fetch-users";
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

  const rawBody = await request.json();

  const authorId = rawBody.authorId;
  if (!authorId) {
    return NextResponse.json({ error: "authorId is required" }, { status: 400 });
  }

  const eligibleAuthors = await getEligibleHeraldUsers();
  if (!isEligibleAuthor(authorId, eligibleAuthors)) {
    return NextResponse.json(
      { error: "authorId must be a staff member with TC Official Website access" },
      { status: 400 },
    );
  }

  const input: ArticleInput = {
    ...rawBody,
    authorId,
    publishAt: rawBody.publishAt ? new Date(rawBody.publishAt) : null,
  };

  const article = await articleService.staff.save(input);
  return NextResponse.json({ article }, { status: 201 });
}
