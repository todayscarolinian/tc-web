import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await sessionService.getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const article = await articleService.staff.publish(slug);

    // on-demand revalidation so the new article is reachable
    // without waiting for the next full deploy or fallback window.
    revalidatePath(`/article/${article.slug}`);
    revalidatePath(`/section/${article.sectionSlug}`);
    revalidatePath("/");

    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 },
    );
  }
}
