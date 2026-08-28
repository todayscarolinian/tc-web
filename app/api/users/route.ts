// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getEligibleHeraldUsers } from "@/src/lib/herald/fetch-users";
import { sessionService } from "@/src/entities/auth/services/auth.service.factory";

export async function GET() {
  const session = await sessionService.getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getEligibleHeraldUsers();
  return NextResponse.json({ users });
}