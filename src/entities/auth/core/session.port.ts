import type { StaffSession } from "./auth.types";

export interface SessionPort {
  getCurrentStaffSession(): Promise<StaffSession>;
}
