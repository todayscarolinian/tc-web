import type { SessionPort } from "@/src/domain/auth/session.port";
import { InMemorySessionAdapter } from "./in-memory-session.adapter";

// Not yet consumed by app/(staff)/layout.tsx or a proxy.ts — see
// docs/architecture.md for where staff-route guarding plugs in once
// BetterAuth + a database are chosen.
const sessionPort: SessionPort = new InMemorySessionAdapter();

export const sessionService = {
  getCurrentStaffSession: () => sessionPort.getCurrentStaffSession(),
};
