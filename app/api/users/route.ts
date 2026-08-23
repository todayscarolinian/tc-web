// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getAllHeraldUsers } from "@/src/lib/herald/fetch-users";
import { sessionService } from "@/src/infrastructure/auth/auth.composition";

export async function GET() {
  // const session = await sessionService.getCurrentStaffSession();
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const users = await getAllHeraldUsers();
  return NextResponse.json({ users });
}