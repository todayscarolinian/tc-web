import { NextResponse } from "next/server";
import { articleService } from "@/src/infrastructure/article/article.composition";

// Demonstrates exposing the same use-case an internal page uses, over HTTP,
// for a future external/mobile/decoupled-frontend consumer.
export async function GET() {
  const articles = await articleService.listPublished();
  return NextResponse.json({ articles });
}
