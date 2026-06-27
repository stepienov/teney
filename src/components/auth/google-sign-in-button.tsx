"use client";

import { useEffect, useRef } from "react";

import {
  useOptionalGoogleIdentity,
} from "@/components/auth/google-identity-provider";
import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  clientId?: string;
  disabled?: boolean;
  label: string;
  className?: string;
};

/**
 * Visible "Google" button (login + register in one step via id token → POST /api/auth/oauth/google).
 * Uses Google Identity Services under the hood; official button is hidden and triggered on click.
 */
export function GoogleSignInButton({
  clientId: clientIdProp,
  disabled = false,
  label,
  className,
}: GoogleSignInButtonProps) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const gsi = useOptionalGoogleIdentity();
  const clientId = clientIdProp ?? gsi?.clientId;
  const gsiReady = gsi?.gsiReady ?? false;

  useEffect(() => {
    if (!gsiReady || !hiddenRef.current || !window.google?.accounts?.id) {
      return;
    }

    hiddenRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(hiddenRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 400,
    });
  }, [gsiReady]);

  function handleClick() {
    const googleBtn = hiddenRef.current?.querySelector(
      '[role="button"]',
    ) as HTMLElement | null;
    googleBtn?.click();
  }

  if (!clientId) {
    return null;
  }

  return (
    <>
      <div
        ref={hiddenRef}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled || !gsiReady}
        onClick={handleClick}
        className={cn(
          "h-10 w-full gap-2.5 border-border bg-white text-sm font-medium text-foreground shadow-xs hover:bg-muted/40",
          className,
        )}
        aria-label={label}
      >
        <GoogleLogo className="size-5 shrink-0" />
        Google
      </Button>
    </>
  );
}
