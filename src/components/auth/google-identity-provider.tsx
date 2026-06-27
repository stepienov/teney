"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ensureGoogleIdentityInitialized,
  setGoogleCredentialDefaultHandler,
  setGoogleCredentialOverrideHandler,
} from "@/lib/auth/google-gsi";

type GoogleCredentialHandler = (idToken: string) => void | Promise<void>;

type GoogleIdentityContextValue = {
  clientId: string | undefined;
  gsiReady: boolean;
  registerCredentialHandler: (handler: GoogleCredentialHandler | null) => void;
  registerDefaultCredentialHandler: (
    handler: GoogleCredentialHandler | null,
  ) => void;
};

const GoogleIdentityContext = createContext<GoogleIdentityContextValue | null>(
  null,
);

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
              getDismissedReason: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}

export function GoogleIdentityProvider({
  clientId,
  children,
}: {
  clientId?: string;
  children: ReactNode;
}) {
  const [gsiReady, setGsiReady] = useState(false);

  const registerCredentialHandler = useCallback(
    (handler: GoogleCredentialHandler | null) => {
      setGoogleCredentialOverrideHandler(handler);
    },
    [],
  );

  const registerDefaultCredentialHandler = useCallback(
    (handler: GoogleCredentialHandler | null) => {
      setGoogleCredentialDefaultHandler(handler);
    },
    [],
  );

  const handleScriptReady = useCallback(() => {
    if (!clientId) {
      return;
    }

    if (ensureGoogleIdentityInitialized(clientId)) {
      setGsiReady(true);
    }
  }, [clientId]);

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleIdentityContext.Provider
      value={{
        clientId,
        gsiReady,
        registerCredentialHandler,
        registerDefaultCredentialHandler,
      }}
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={handleScriptReady}
      />
      {children}
    </GoogleIdentityContext.Provider>
  );
}

export function useRegisterGoogleCredentialHandler(
  handler: GoogleCredentialHandler | null,
) {
  const ctx = useContext(GoogleIdentityContext);

  useEffect(() => {
    if (!ctx) {
      return;
    }
    ctx.registerCredentialHandler(handler);
    return () => ctx.registerCredentialHandler(null);
  }, [ctx, handler]);
}

export function useRegisterGoogleDefaultCredentialHandler(
  handler: GoogleCredentialHandler | null,
) {
  const ctx = useContext(GoogleIdentityContext);

  useEffect(() => {
    if (!ctx) {
      return;
    }
    ctx.registerDefaultCredentialHandler(handler);
    return () => ctx.registerDefaultCredentialHandler(null);
  }, [ctx, handler]);
}

export function useGoogleIdentity() {
  const ctx = useContext(GoogleIdentityContext);
  if (ctx == null) {
    throw new Error(
      "useGoogleIdentity must be used within GoogleIdentityProvider",
    );
  }
  return ctx;
}

export function useOptionalGoogleIdentity() {
  return useContext(GoogleIdentityContext);
}
