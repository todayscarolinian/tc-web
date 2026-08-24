// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";
import { getEligibleHeraldUsers, isEligibleAuthor } from "@/src/lib/herald/fetch-users";
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
  };

  try {
    const article = await articleService.staff.update(slug, input);

    // on-demand revalidation so edits to a published article
    // show up on the public page without waiting for the fallback window.
    revalidatePath(`/article/${article.slug}`);

    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 },
    );
  }
}
