# Herald SSO Integration — Status & Next Steps

Herald is Today's Carolinian's centralized auth service, shared across every
`*.todayscarolinian.com` property. This doc tracks **TC Web's** integration
specifically: what's built, what's stubbed, and what's left before staff
login actually gates the CMS.

This was originally written for USC Days (the first property integrated)
and has been rewritten here for TC Web's architecture. Where the two
properties made different calls, that's called out — don't assume anything
below is a universal Herald pattern.

## Table of Contents

-   [What Herald Is](#what-herald-is)
-   [Status in TC Web today](#status-in-tc-web-today)
-   [Decisions made for TC Web](#decisions-made-for-tc-web)
-   [1. Env vars](#1-env-vars)
-   [2. The client files (`src/lib/herald/`) — done](#2-the-client-files-srclibherald--done)
-   [3. Wiring Herald into `SessionPort` — not done](#3-wiring-herald-into-sessionport--not-done)
-   [4. Page-level gating (`proxy.ts`) — not done](#4-page-level-gating-proxyts--not-done)
-   [5. Gating mutations (server-side) — not done](#5-gating-mutations-server-side--not-done)
-   [6. Login / logout](#6-login--logout)
-   [7. Author attribution — design decided, not implemented](#7-author-attribution--design-decided-not-implemented)
-   [8. Herald-operator prerequisites](#8-herald-operator-prerequisites)
-   [9. Verification checklist](#9-verification-checklist)
-   [Known gaps](#known-gaps)

---

## What Herald Is

Herald issues one session cookie shared across every TC property. A user
logged into Herald anywhere is recognized everywhere, and Herald — not this
app — owns the login UI, account creation, and password/OAuth flow.

Each Herald user has a `domains: Domain[]` array
(`'TC Official Website' | 'USC Days' | 'TC Digital Archives' | 'TC Herald'`).
Being logged into Herald does not imply access to TC Web's CMS — a user can
be a valid Herald identity without `'TC Official Website'` in their
`domains`. Two checks, not one:

-   **Authenticated** — is there a valid Herald session at all?
-   **Authorized** — does that session's user have `'TC Official Website'`
    in `domains`?

Session verification is server-to-server: this app's backend calls
Herald's `GET /auth/verify-session` with the forwarded cookie and an
internal API key; Herald reports who the user is and whether the session
is valid. This app never validates the cookie itself.

## Status in TC Web today

The client files exist (`src/lib/herald/*`) and are functionally complete,
but **nothing in the app imports them yet**. Confirm with:

```
grep -rl "herald" src app --include=*.ts --include=*.tsx | grep -v src/lib/herald
```

Concretely:

-   `domain/auth/session.port.ts` (`SessionPort`) is implemented only by
    `infrastructure/auth/in-memory-session.adapter.ts`, which always
    returns a hardcoded `CURRENT_STAFF_USER` — there is no unauthenticated
    path anywhere in the app right now.
-   `app/(staff)/layout.tsx` renders `<StaffShell>` unconditionally. Every
    `/staff/*` route — article drafts included — is publicly reachable.
-   No mutating Route Handler or Server Action currently checks Herald
    access before writing.

So this isn't "adapt USC Days' pattern to a new app" — the pattern is
already adapted (§2 below). What's left is wiring it in (§3–§5).

## Decisions made for TC Web

1.  **Herald replaces a stub, not a live system.** TC Web's current
    "auth" is `InMemorySessionAdapter` always logging in one mock user.
    There's nothing to migrate off of or run alongside — Herald is just
    the real implementation of `SessionPort` filling in a seam that was
    built for exactly this (see `docs/architecture.md` → "Where Herald and
    Firestore plug in later").

2.  **Page-level gating is required.** `/staff/*` exposes
    Draft/Scheduled article content, which must not be visible to
    unauthorized requests, not just unpublishable by them. TC Web needs
    real route-level gating (§4), not just hidden buttons.

3.  **`REQUIRED_DOMAIN` is `'TC Official Website'`.** Already set in
    `types.ts`. TC Web is a single property with one CMS — there's no
    per-section domain split to worry about.

4.  **Author attribution: `authorId` (Herald) + `authorName` (snapshot),
    no separate users table.** `Article.author` is currently a free-text
    string (`domain/article/article.entity.ts`). The plan is to replace it
    with `authorId` (Herald's `user.id`, set server-side from the verified
    session — never client-supplied) as the source of truth, plus
    `authorName` (a display-name snapshot captured at publish time) for
    rendering the byline. See [§7](#7-author-attribution--design-decided-not-implemented)
    for why this is a snapshot and not a live Herald lookup.

## 1. Env vars

Not yet set anywhere (no `.env.example` in the repo). Needed:

```
# Herald SSO
HERALD_INTERNAL_API_KEY=          # server-to-server key for verify-session, never exposed to the client
NEXT_PUBLIC_HERALD_AUTH_URL=      # Herald Auth's base URL, exposed to the client for the auth SDK / logout call
```

`HERALD_INTERNAL_API_KEY` must never end up in client-bundled code —
`import "server-only"` in `verify-session.ts` and `require-access.ts`
protects against that at build time. Provision the key out-of-band and set
it via the host's env var dashboard; never commit it. Confirm with
whoever operates Herald that TC Web's origin(s) — prod, preview, local —
are allowlisted before testing (see [§8](#8-herald-operator-prerequisites)).

## 2. The client files (`src/lib/herald/`) — done

`better-auth` and `server-only` are already in `package.json`. Six files,
no shared abstraction — each caller does its own status-code mapping,
consistent with this app's Route Handlers staying self-contained.

| File | Purpose |
|---|---|
| [`types.ts`](types.ts) | Mirrors Herald's response contract. `REQUIRED_DOMAIN = 'TC Official Website'` lives here. |
| [`verify-session.ts`](verify-session.ts) | `verifySessionFromCookie()` — the only file that talks to Herald server-to-server. `cache: "no-store"`, fails **closed** on missing env vars or network errors (`status: "error"`, never a silent allow). `import "server-only"` is load-bearing. |
| [`authorize.ts`](authorize.ts) | `isAuthorized(user)` — the domain check, kept separate from session verification so authentication and authorization don't get tangled into one function. |
| [`require-access.ts`](require-access.ts) | `requireHeraldAccess(cookieHeader)` — composes verify + authorize into one `AccessResult`, fail-closed on every branch including `SERVICE_ERROR` (Herald unreachable ≠ allowed). This is what every protected Route Handler / Server Action will call. |
| [`auth-client.ts`](auth-client.ts) | Client-side session reader, backed by `better-auth/react`. Exports `useSession` and `signOutFromHerald()`. |
| [`use-has-domain-access.ts`](use-has-domain-access.ts) | `useHasHeraldDomainAccess()` — returns `{ isPending, isAuthenticated, hasAccess }` as three separate values. Keep `isAuthenticated` and `hasAccess` distinct in any UI that consumes this: a user can be a valid Herald identity without `'TC Official Website'` access, and collapsing the two loses the "you're logged in, but not into this app" state along with the logout affordance. |

These six files are the boundary to Herald itself and shouldn't need much
further code — the work left is consuming them (§3–§5).

## 3. Wiring Herald into `SessionPort` — not done

`domain/auth/session.port.ts` defines:

```ts
export interface SessionPort {
  getCurrentStaffSession(): Promise<StaffSession>;
}
```

```ts
export type StaffSession = {
  userId: string;
  name: string;
  role: string;
  initials: string;
} | null;
```

`StaffSession` doesn't map 1:1 onto `HeraldUser` — `HeraldUser` has
`firstName`/`middleName`/`lastName`/`positions`, not `name`/`role`/
`initials`. A Herald-backed adapter needs to derive these:

```ts
// infrastructure/auth/herald-session.adapter.ts
import "server-only";
import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import type { SessionPort } from "@/src/domain/auth/session.port";
import type { StaffSession } from "@/src/domain/auth/staff-session.value-object";

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
```

`positions[0]` as "the role" is a guess — confirm with whoever seeds
Herald's `positions` data whether it's ordered meaningfully or this needs
a different mapping (e.g. a specific position string to look for).

Then swap the instantiation in `infrastructure/auth/auth.composition.ts`:

```ts
const sessionPort: SessionPort = new HeraldSessionAdapter();
```

Nothing in `application/auth/` or `app/` needs to change — that's the
point of the port/adapter seam already in place.

## 4. Page-level gating (`proxy.ts`) — not done

Per [decision #2](#decisions-made-for-tc-web), `/staff/*` must not be
viewable by unauthorized requests, not just unmutable. Next.js 16 renamed
`middleware.ts` to `proxy.ts` — use the new convention
(`node_modules/next/dist/docs/` has the migration notes if anything here
looks off).

```ts
// proxy.ts (repo root)
import { NextRequest, NextResponse } from "next/server";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";

export async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/staff")) return NextResponse.next();

  const access = await requireHeraldAccess(req.headers.get("cookie"));
  if (isAccessError(access)) {
    const loginUrl = new URL(process.env.NEXT_PUBLIC_HERALD_AUTH_URL + "/login");
    loginUrl.searchParams.set("redirect", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: "/staff/:path*" };
```

Confirm the actual login-redirect URL shape with whoever operates Herald
— the above assumes a `?redirect=` param but that's not confirmed against
Herald's actual login route.

`app/(staff)/layout.tsx` can stay as-is once this exists — the proxy stops
unauthorized requests before the layout ever renders. Only revisit the
layout if you want it to also read the session (e.g. to show the staff
member's name in `StaffShell`), in which case it calls
`sessionService.getCurrentStaffSession()` the same way any other
server component would.

## 5. Gating mutations (server-side) — not done

Even with proxy-level gating, every mutating Route Handler / Server Action
under `/staff` should independently re-verify — the proxy stops page
*loads*, not necessarily every code path that can trigger a write (e.g. a
Server Action invoked from a route the proxy didn't match, or invoked
directly). Belt-and-suspenders, not redundant:

```ts
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import { NextRequest, NextResponse } from "next/server";

function accessErrorResponse(error: "UNAUTHENTICATED" | "FORBIDDEN" | "SERVICE_ERROR", message: string) {
  return NextResponse.json(
    { error: message },
    { status: error === "UNAUTHENTICATED" ? 401 : error === "FORBIDDEN" ? 403 : 502 }
  );
}

export async function POST(req: NextRequest) {
  const access = await requireHeraldAccess(req.headers.get("cookie"));
  if (isAccessError(access)) {
    return accessErrorResponse(access.error, access.message);
  }
  // ...proceed with the mutation, access.user is the verified Herald identity...
}
```

`SERVICE_ERROR` (Herald unreachable, misconfigured env vars, bad response)
must map to a denial (502), never a silent allow.

## 6. Login / logout

Herald owns the login UI — this app doesn't build its own login page or
OAuth callback route.

-   **Session read**: `useSession()` from `auth-client.ts`, consumed via
    `useHasHeraldDomainAccess()`.
-   **Logout**: `signOutFromHerald()` hits Herald's `/auth/logout` with
    `credentials: "include"` so the shared cookie clears, then a reload so
    `useSession()` picks up the cleared state:

```ts
const handleLogout = async () => {
  await signOutFromHerald();
  window.location.reload();
};
```

## 7. Author attribution — design decided, not implemented

`Article.author` (`domain/article/article.entity.ts:12`) is currently a
free-text string. The plan: replace it with two fields —

-   **`authorId`** — Herald's `user.id`, the source of truth. Set only
    server-side from `access.user.id` (the verified session) at publish
    time — never from a client-supplied field, or it's an IDOR (any caller
    could attribute an article to an arbitrary identity by editing a
    request body).
-   **`authorName`** — a display-name snapshot (`firstName + lastName`)
    captured at the same time, stored on the article doc, and used to
    render the byline.

**Why a snapshot instead of resolving the name live from Herald:** reader
routes are ISR per [ADR-004](../../../docs/adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)
— pages are generated once and revalidated on publish, not re-fetched
per-visitor. A live lookup could technically run at revalidation time
without breaking that model, but it would require (a) a new Herald
endpoint — `verify-session.ts` authenticates *the caller's own* session,
which isn't the same query as "look up display name for arbitrary user id
X" for a reader with no session at all — and (b) a hard runtime dependency
on Herald being reachable, and that staff account still existing, every
time an already-published article revalidates. A snapshot has zero
runtime dependency on Herald to render published content, and "the byline
doesn't retroactively change when someone updates their Herald profile"
is normal newsroom behavior, not a bug.

This isn't implemented yet — no migration for existing `lib/articles.ts`
mock data, no update to `article.entity.ts`, `ArticleRecord` mapping, or
the staff publish flow. Flagging the design so whoever picks this up
doesn't have to re-litigate it.

## 8. Herald-operator prerequisites

Confirm these with whoever administers Herald before end-to-end testing —
they're outside this repo:

-   [ ] Herald's `ALLOWED_ORIGINS` allowlists TC Web's origin(s) — prod,
        preview, and local dev.
-   [ ] `HERALD_INTERNAL_API_KEY` is provisioned for TC Web specifically
        and set in the host's env var dashboard (never committed).
-   [ ] `'TC Official Website'` is the exact literal Herald has configured
        for this property (confirm against `types.ts`'s `Domain` union).
-   [ ] Real staff who need CMS access have actually been granted
        `'TC Official Website'` in Herald.
-   [ ] Confirm Herald's production 
        `NEXT_PUBLIC_HERALD_AUTH_URL` value.
-   [ ] If §7 ships, confirm whether Herald exposes (or will expose) a
        server-to-server "get user by id" lookup, needed at publish time
        to resolve `authorName` — or whether the currently-authenticated
        staff session (`access.user`) is always sufficient (it should be,
        since the author publishing *is* the signed-in user).

## 9. Verification checklist

Once §3–§5 are built, run against a real or stubbed Herald session:

1.  **No Herald session** — `/staff/*` redirects to Herald login;
    reader-facing routes load normally.
2.  **Herald session, no `'TC Official Website'` access** — proxy still
    redirects (or shows a "not authorized for this app" state, if that's
    preferred over a redirect loop back to Herald login — decide which).
3.  **Herald session with access** — `/staff/*` loads, `StaffShell` shows
    the real staff member's name/initials/role via `sessionService`, and
    a publish action succeeds with correct `authorId`/`authorName`.
4.  **Security regression test** — `curl -X POST <mutating-endpoint>` with
    no cookie must fail (401).
5.  **IDOR check** — a mutation can't set `authorId` to another user's id
    via a client-supplied field.
6.  **Logout** — cookie actually clears against the shared domain
    (DevTools → Application → Cookies); UI reverts to signed-out and
    `/staff/*` redirects again on next visit.
7.  **Fail-closed check** — unset `NEXT_PUBLIC_HERALD_AUTH_URL` or
    `HERALD_INTERNAL_API_KEY` locally; `/staff/*` and mutating endpoints
    should deny (502/`SERVICE_ERROR`), not crash or silently allow access.
8.  **Build sanity** — confirm `server-only` actually breaks the build if
    `verify-session.ts` or `require-access.ts` is ever imported into a
    client component.

---

## Known gaps

-   **Nothing is wired in yet.** §2 is done; §3, §4, §5, and §7 are design
    only. This is the primary gap — see [Status in TC Web today](#status-in-tc-web-today).
-   **`positions[0]` as "role" is unconfirmed** (§3) — depends on how
    Herald's operator actually populates that array.
-   **No page for "authenticated but not authorized for this property."**
    §4's `proxy.ts` sketch redirects straight back to Herald login on
    `FORBIDDEN`, which could loop if the user's Herald session is valid
    but genuinely lacks `'TC Official Website'` access. USC Days handled
    this case with an in-app "you're logged in, but not into this app"
    state (enabled by keeping `isAuthenticated`/`hasAccess` distinct) —
    TC Web needs the page-level equivalent, likely a dedicated
    `/staff/unauthorized` route rather than a redirect loop.
