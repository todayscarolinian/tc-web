"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/error-state";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorState
        title="This page hit a snag"
        description="Something went wrong loading this story. Try again, or head back to the front page."
        onRetry={reset}
      />
    </div>
  );
}
