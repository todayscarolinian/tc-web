import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";

export async function proxy(request: NextRequest) {
  // if (!request.nextUrl.pathname.startsWith("/staff")) {
  //   return NextResponse.next();
  // }

  // const access = await requireHeraldAccess(request.headers.get("cookie"));
  // if (isAccessError(access) && access.error === "UNAUTHENTICATED") {
  //   const loginUrl = new URL(`${process.env.NEXT_PUBLIC_HERALD_CORE_URL}/login`);
  //   loginUrl.searchParams.set("redirect", request.nextUrl.href);
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: "/staff/:path*",
};
