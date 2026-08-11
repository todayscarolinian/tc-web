import type { SessionPort } from "@/src/domain/auth/session.port";
import { HeraldSessionAdapter } from "./herald-session.adapter";

const sessionPort: SessionPort = new HeraldSessionAdapter();

export const sessionService = {
  getCurrentStaffSession: () => sessionPort.getCurrentStaffSession(),
};
