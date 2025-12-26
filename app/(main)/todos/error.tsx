'use client';

import { Button } from "@/components/ui/button";

export default function TodosError({
  error,
  reset,
}: {
  error: Error & { digest?: string; };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-10">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-2">Failed to load todos</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
