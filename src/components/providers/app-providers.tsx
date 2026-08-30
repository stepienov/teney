"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";

import { AuthReturnUrlTracker } from "@/components/auth/auth-return-url-tracker";
import { GoogleIdentityProvider } from "@/components/auth/google-identity-provider";
import { GoogleIdentityServices } from "@/components/auth/google-identity-services";
import { AuthOperationLoadingProvider } from "@/components/providers/auth-operation-loading";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NavigationLoadingProvider } from "@/components/providers/navigation-loading";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { createQueryClient } from "@/lib/query/client";

type AppProvidersProps = {
  children: React.ReactNode;
  googleClientId?: string;
};

export function AppProviders({ children, googleClientId }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={null}>
            <NavigationLoadingProvider>
              <AuthOperationLoadingProvider>
                <GoogleIdentityProvider clientId={googleClientId}>
                  <AuthReturnUrlTracker />
                  <GoogleIdentityServices />
                  {children}
                </GoogleIdentityProvider>
              </AuthOperationLoadingProvider>
            </NavigationLoadingProvider>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
