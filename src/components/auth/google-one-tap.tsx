"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

import {
  useRegisterGoogleDefaultCredentialHandler,
  useOptionalGoogleIdentity,
} from "@/components/auth/google-identity-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useAuthOperationLoading } from "@/components/providers/auth-operation-loading";
import { useNavigationRouter } from "@/components/providers/navigation-loading";
import { usePathname } from "@/i18n/routing";
import { locales, type AppLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api-client";
import {
  cancelGoogleOneTap,
  promptGoogleOneTapOnce,
  resetGoogleOneTapSession,
} from "@/lib/auth/google-gsi";
import { consumeAuthReturnPath } from "@/lib/auth/return-url";
import {
  detectBrowserAppLocale,
  detectBrowserCountryCode,
} from "@/lib/browser-user-preferences";

/**
 * Default Google credential flow for One Tap and other non-form entry points.
 * Auth form registers an override handler while mounted.
 */
export function GoogleAuthCredentialBridge() {
  const { status, loginWithGoogle } = useAuth();
  const router = useNavigationRouter();
  const locale = useLocale();
  const { startAuthOperation, stopAuthOperation } = useAuthOperationLoading();

  const handleCredential = useCallback(
    async (idToken: string) => {
      if (status === "authenticated") {
        return;
      }

      startAuthOperation("google");
      try {
        await loginWithGoogle(idToken, {
          preferredLocale: detectBrowserAppLocale(locale as AppLocale),
          countryCode: detectBrowserCountryCode(),
        });
        router.push(consumeAuthReturnPath("/"));
      } catch (error) {
        stopAuthOperation();
        if (error instanceof ApiError) {
          console.error("Google sign-in failed", error.status);
        }
      }
    },
    [
      locale,
      loginWithGoogle,
      router,
      startAuthOperation,
      status,
      stopAuthOperation,
    ],
  );

  useRegisterGoogleDefaultCredentialHandler(
    status === "unauthenticated" ? handleCredential : null,
  );

  return null;
}

/**
 * Shows Google One Tap for guests (not on login/register pages).
 */
function isLocaleHomePath(pathname: string): boolean {
  return locales.some((locale) => pathname === `/${locale}`);
}

export function GoogleOneTap() {
  const { status } = useAuth();
  const gsi = useOptionalGoogleIdentity();
  const pathname = usePathname();
  const prevStatusRef = useRef(status);
  const isHomePage = isLocaleHomePath(pathname);

  useEffect(() => {
    if (
      prevStatusRef.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      resetGoogleOneTapSession();
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (
      !isHomePage ||
      status !== "unauthenticated" ||
      !gsi?.gsiReady
    ) {
      return;
    }

    promptGoogleOneTapOnce({ delayMs: 500 });

    return () => {
      cancelGoogleOneTap();
    };
  }, [gsi?.gsiReady, isHomePage, pathname, status]);

  return null;
}
