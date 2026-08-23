// src/lib/herald/fetch-authors.ts
import "server-only";
import { cookies } from "next/headers";
import type { UserProfile } from "@/src/lib/herald/types";

export async function getAllHeraldUsers(): Promise<UserProfile[]> {
  const coreUrl = process.env.NEXT_PUBLIC_HERALD_CORE_URL; // http://localhost:3002
  const cookieHeader = (await cookies()).toString();

  if (!coreUrl) {
    throw new Error("Herald core URL not configured");
  }

  const res = await fetch(`${coreUrl}/api/users`, {
    method: "GET",
    headers: { cookie: cookieHeader }, // forward the logged-in user's session cookie
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Herald users fetch failed: ${res.status}`);
  }

  const body = await res.json();
  return body.data?.items ?? body.data ?? body.users ?? body;
}