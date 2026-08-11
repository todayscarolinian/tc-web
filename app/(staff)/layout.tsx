import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import { StaffShell } from "@/components/staff/staff-shell";
import { ErrorState } from "@/components/site/error-state";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);

  if (isAccessError(access)) {
    if (access.error === "UNAUTHENTICATED") {
      // window is not defined on the server, so we can't use window.location.href directly. Instead, we can use the request URL to construct the redirect URL.
      redirect(`${process.env.NEXT_PUBLIC_HERALD_CORE_URL}/login?redirect=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + "/staff")}`);
    }
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-8">
        <ErrorState title="Access denied" description={access.message} />
      </div>
    );
  }

  return <StaffShell>{children}</StaffShell>;
}
