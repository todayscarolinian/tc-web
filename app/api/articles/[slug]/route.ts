// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";
import { getEligibleHeraldUsers, isEligibleAuthor } from "@/src/lib/herald/fetch-users";
import type { ArticleInput } from "@/src/entities/article/core/article.domain";

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
    publishAt: rawBody.publishAt ? new Date(rawBody.publishAt) : null,
  };

  try {
    const article = await articleService.staff.update(slug, input);

    revalidatePath(`/article/${article.slug}`);
    revalidatePath(`/section/${article.sectionSlug}`);
    revalidatePath("/section/[section]/page/[page]", "page");
    revalidatePath(`/author/${article.authorId}`);

    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 },
    );
  }
}
