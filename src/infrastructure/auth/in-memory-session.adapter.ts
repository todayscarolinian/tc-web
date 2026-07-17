import { CURRENT_STAFF_USER } from "@/src/lib/staff-data";
import type { SessionPort } from "@/src/domain/auth/session.port";
import type { StaffSession } from "@/src/domain/auth/staff-session.value-object";

// Always-authenticated stub — no real session/cookie/JWT check happens
// here. This is the exact seam where a BetterAuth-backed adapter plugs in
// once a database is chosen: implement SessionPort against BetterAuth's
// session API and swap the instantiation in auth.composition.ts.
export class InMemorySessionAdapter implements SessionPort {
  async getCurrentStaffSession(): Promise<StaffSession> {
    return {
      userId: "staff-1",
      name: CURRENT_STAFF_USER.name,
      role: CURRENT_STAFF_USER.role,
      initials: CURRENT_STAFF_USER.initials,
    };
  }
}
