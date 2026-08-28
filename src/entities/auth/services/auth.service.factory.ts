import type { SessionPort } from "@/src/entities/auth/core/session.port";
import { HeraldSessionAdapter } from "@/src/entities/auth/infrastructure/herald-session.adapter";

const sessionPort: SessionPort = new HeraldSessionAdapter();

export const sessionService = {
  getCurrentStaffSession: () => sessionPort.getCurrentStaffSession(),
};
