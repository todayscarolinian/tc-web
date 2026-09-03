import { NextResponse } from "next/server";

import { articleService } from "@/src/entities/article/services/article.service.factory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = await articleService.getBySlug(slug);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const articles = await articleService.listRelatedArticles(article);

  return NextResponse.json({ articles });
}
