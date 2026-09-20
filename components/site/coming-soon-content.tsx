import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoonContent() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <Clock className="mb-4 text-brand" size={40} strokeWidth={1.5} />
      <span className="tc-kicker text-brand">Coming soon</span>
      <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
        This page is still in the works
      </h1>
      <p className="mt-3 max-w-md text-base leading-6 text-text-secondary">
        We&apos;re putting the finishing touches on this page. Check back soon, or head
        back to the front page for today&apos;s coverage in the meantime.
      </p>
      <Link href="/" className="mt-6">
        <Button type="button">Back to the front page</Button>
      </Link>
    </div>
  );
}
