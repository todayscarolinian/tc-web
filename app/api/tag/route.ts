import { NextResponse } from "next/server";
import { tagService } from "@/src/infrastructure/tag/tag.composition";

export async function GET() {
  const tags = await tagService.listAll();
  return NextResponse.json({ tags });
}