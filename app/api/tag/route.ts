import { NextResponse } from "next/server";
import { tagService } from "@/src/entities/tag/services/tag.service.factory";

export async function GET() {
  const tags = await tagService.listAll();
  return NextResponse.json({ tags });
}