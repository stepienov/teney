"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

import {
  useRegisterGoogleDefaultCredentialHandler,
  useOptionalGoogleIdentity,
} from "@/components/auth/google-identity-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/routing";
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
  const router = useRouter();
  const locale = useLocale();

  const handleCredential = useCallback(
    async (idToken: string) => {
      if (status === "authenticated") {
        return;
      }

      try {
        await loginWithGoogle(idToken, {
          preferredLocale: detectBrowserAppLocale(locale as AppLocale),
          countryCode: detectBrowserCountryCode(),
        });
        router.push(consumeAuthReturnPath("/"));
      } catch (error) {
        if (error instanceof ApiError) {
          console.error("Google sign-in failed", error.status);
        }
      }
    },
    [locale, loginWithGoogle, router, status],
  );

  useRegisterGoogleDefaultCredentialHandler(
    status === "unauthenticated" ? handleCredential : null,
  );

  return null;
}

/**
 * Shows Google One Tap for guests (not on login/register pages).
 */
export function GoogleOneTap() {
  const { status } = useAuth();
  const gsi = useOptionalGoogleIdentity();
  const prevStatusRef = useRef(status);

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
    if (status === "authenticated") {
      cancelGoogleOneTap();
      return;
    }

    if (status !== "unauthenticated" || !gsi?.gsiReady) {
      return;
    }

    promptGoogleOneTapOnce();
  }, [gsi?.gsiReady, status]);

  useEffect(() => {
    return () => {
      cancelGoogleOneTap();
    };
  }, []);

  return null;
}
