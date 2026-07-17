import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <FileQuestion className="mb-4 text-brand" size={40} strokeWidth={1.5} />
      <span className="tc-kicker text-brand">404</span>
      <h1 className="font-display mt-2 text-3xl font-extrabold text-foreground">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-base leading-6 text-text-secondary">
        It may have been moved, deleted, or never existed. Head back to the dashboard.
      </p>
      <Link href="/staff" className="mt-6">
        <Button type="button">Back to dashboard</Button>
      </Link>
    </div>
  );
}
