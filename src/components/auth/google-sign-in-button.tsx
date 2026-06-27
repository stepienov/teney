"use client";

import { useCallback, useEffect, useRef } from "react";

import { useOptionalGoogleIdentity } from "@/components/auth/google-identity-provider";
import { GoogleLogo } from "@/components/auth/google-logo";
import { renderGoogleSignInButton } from "@/lib/auth/google-gsi";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  clientId?: string;
  disabled?: boolean;
  label: string;
  className?: string;
};

/**
 * Custom Google look with the real Google sign-in button as a full-size transparent
 * overlay — the user clicks Google's own control (not a synthetic .click()).
 */
export function GoogleSignInButton({
  clientId: clientIdProp,
  disabled = false,
  label,
  className,
}: GoogleSignInButtonProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const gsi = useOptionalGoogleIdentity();
  const clientId = clientIdProp ?? gsi?.clientId;
  const gsiReady = gsi?.gsiReady ?? false;
  const inactive = disabled || !gsiReady;

  const mountGoogleOverlay = useCallback(() => {
    const container = overlayRef.current;
    if (!container || !gsiReady || disabled) {
      return;
    }

    const width = Math.max(container.offsetWidth, 240);
    container.innerHTML = "";
    window.google?.accounts?.id?.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      width,
    });
  }, [disabled, gsiReady]);

  useEffect(() => {
    mountGoogleOverlay();
  }, [mountGoogleOverlay]);

  useEffect(() => {
    const container = overlayRef.current;
    if (!container || !gsiReady || disabled) {
      return;
    }

    const observer = new ResizeObserver(() => {
      mountGoogleOverlay();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [disabled, gsiReady, mountGoogleOverlay]);

  if (!clientId) {
    return null;
  }

  return (
    <div className={cn("relative h-10 w-full", className)}>
      <div
        className={cn(
          "pointer-events-none flex h-full w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-white text-sm font-medium text-foreground shadow-xs",
          inactive && "opacity-50",
        )}
        aria-hidden
      >
        <GoogleLogo className="size-5 shrink-0" />
        Google
      </div>

      <div
        ref={overlayRef}
        className={cn(
          "absolute inset-0 z-10 overflow-hidden opacity-[0.011] [&_div]:!h-full [&_div]:!w-full [&_iframe]:!h-full [&_iframe]:!min-h-10 [&_iframe]:!w-full",
          inactive && "pointer-events-none",
        )}
        aria-label={label}
      />
    </div>
  );
}
