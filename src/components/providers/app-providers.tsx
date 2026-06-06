"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";

import { NavigationLoadingProvider } from "@/components/providers/navigation-loading";
import { createQueryClient } from "@/lib/query/client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <NavigationLoadingProvider>{children}</NavigationLoadingProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
