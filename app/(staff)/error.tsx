"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/error-state";

export default function StaffError({
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
    <div className="flex min-h-[70vh] items-center justify-center p-8">
      <ErrorState
        title="This page hit a snag"
        description="Something went wrong loading the newsroom tools. Try again in a moment."
        onRetry={reset}
      />
    </div>
  );
}
