import { NextResponse, type NextRequest } from "next/server";
import { articleService } from "@/src/infrastructure/article/article.composition";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const articles = await articleService.search(query);
  return NextResponse.json({ articles });
}
