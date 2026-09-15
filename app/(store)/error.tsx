"use client";

import { ErrorContent } from "@/components/error-content";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorContent
      title="Something went wrong"
      description="This page could not be loaded. Try again, or go back to the catalog."
      reset={reset}
    />
  );
}
