"use client";

import { ErrorContent } from "@/components/error-content";

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorContent
      title="This product could not be loaded"
      description="The catalog is temporarily unavailable. Try again, or browse other products."
      reset={reset}
    />
  );
}
