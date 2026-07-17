# application/auth

No use-case files yet — `sessionService.getCurrentStaffSession()` (from
`infrastructure/auth/auth.composition.ts`) is a direct passthrough to the
`SessionPort` today, with no orchestration logic to wrap.

Once real authorization rules exist (e.g. role checks for specific staff
actions), this is where they'd live, e.g.:

```ts
// require-staff-role.use-case.ts
export function requireStaffRole(session: StaffSession, role: string): void {
  if (!session || session.role !== role) throw new Error("Forbidden");
}
```

See `domain/auth/`, `infrastructure/auth/`, and `docs/architecture.md`.
