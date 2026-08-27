No use-case files yet — `sessionService.getCurrentStaffSession()` (from
`services/auth.service.factory.ts`) is a direct passthrough to the
`SessionPort` today, with no orchestration logic to wrap.

Once real authorization rules exist (e.g. role checks for specific staff
actions), this is where they'd live, e.g.:

```ts
// require-staff-role.usecase.ts
export function requireStaffRole(session: StaffSession, role: string): void {
  if (!session || session.role !== role) throw new Error("Forbidden");
}
```

See `core/`, `infrastructure/`, and `docs/architecture.md`.

**Note (structural move):** this is a pure relocation of already-existing,
already-stubbed code — `InMemorySessionAdapter` is kept in `infrastructure/`
even though `services/auth.service.factory.ts` currently wires
`HeraldSessionAdapter`. Real staff-route gating (`/staff/*` is currently
ungated) is a separately-tracked, deliberately excluded follow-up, not
addressed by this restructuring.
