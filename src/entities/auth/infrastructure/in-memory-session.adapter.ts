import { CURRENT_STAFF_USER } from "@/src/lib/staff-data";
import type { SessionPort } from "@/src/entities/auth/core/session.port";
import type { StaffSession } from "@/src/entities/auth/core/auth.types";

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
