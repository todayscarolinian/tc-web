// app/api/articles/[slug]/sweep/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { sectionSlug, authorId } = await request.json().catch(() => ({}));

  revalidatePath(`/article/${slug}`);
  if (sectionSlug) revalidatePath(`/section/${sectionSlug}`);
  revalidatePath("/section/[section]/page/[page]", "page");
  if (authorId) revalidatePath(`/author/${authorId}`);
  revalidatePath("/");

  return NextResponse.json({ revalidated: true });
}
