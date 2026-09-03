import { NextResponse, type NextRequest } from "next/server";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { toArticleDTO } from "@/src/entities/article/core/article.domain";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const articles = await articleService.search(query);
  return NextResponse.json({ articles: articles.map(toArticleDTO) });
}
