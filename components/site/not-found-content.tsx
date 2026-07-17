import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <Newspaper className="mb-4 text-brand" size={40} strokeWidth={1.5} />
      <span className="tc-kicker text-brand">404</span>
      <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
        This page didn&apos;t make the paper
      </h1>
      <p className="mt-3 max-w-md text-base leading-6 text-text-secondary">
        The story you&apos;re looking for may have been moved, retired, or never existed.
        Head back to the front page for today&apos;s coverage.
      </p>
      <Link href="/" className="mt-6">
        <Button type="button">Back to the front page</Button>
      </Link>
    </div>
  );
}
