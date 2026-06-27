"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";

import { AuthReturnUrlTracker } from "@/components/auth/auth-return-url-tracker";
import { GoogleIdentityProvider } from "@/components/auth/google-identity-provider";
import { GoogleIdentityServices } from "@/components/auth/google-identity-services";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NavigationLoadingProvider } from "@/components/providers/navigation-loading";
import { createQueryClient } from "@/lib/query/client";

type AppProvidersProps = {
  children: React.ReactNode;
  googleClientId?: string;
};

export function AppProviders({ children, googleClientId }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleIdentityProvider clientId={googleClientId}>
          <AuthReturnUrlTracker />
          <GoogleIdentityServices />
          <Suspense fallback={null}>
            <NavigationLoadingProvider>{children}</NavigationLoadingProvider>
          </Suspense>
        </GoogleIdentityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
