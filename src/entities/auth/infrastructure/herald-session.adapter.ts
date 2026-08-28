import "server-only";
import { cookies } from "next/headers";
import {
  requireHeraldAccess,
  isAccessError,
} from "@/src/lib/herald/require-access";
import type { SessionPort } from "@/src/entities/auth/core/session.port";
import type { StaffSession } from "@/src/entities/auth/core/auth.types";

export class HeraldSessionAdapter implements SessionPort {
  async getCurrentStaffSession(): Promise<StaffSession> {
    const cookieHeader = (await cookies()).toString();
    const access = await requireHeraldAccess(cookieHeader);
    if (isAccessError(access)) return null;

    const { user } = access;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return {
      userId: user.id,
      name,
      role: user.positions[0] ?? "Staff",
      initials: `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(),
    };
  }
}
