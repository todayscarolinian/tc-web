import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 },
    );
  }
}
