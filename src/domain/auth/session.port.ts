import type { StaffSession } from "./staff-session.value-object";

// Non-persistence capability port (distinct from a *.repository.ts) — kept
// separate so readers can grep "what talks to a DB" vs "what talks to an
// external capability" (auth/session).
export interface SessionPort {
  getCurrentStaffSession(): Promise<StaffSession>;
}
