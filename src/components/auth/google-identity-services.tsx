"use client";

import { usePathname } from "@/i18n/routing";
import { isAuthReturnPath } from "@/lib/auth/return-url";

import { GoogleAuthCredentialBridge, GoogleOneTap } from "./google-one-tap";

export function GoogleIdentityServices() {
  const pathname = usePathname();
  const onAuthPage = isAuthReturnPath(pathname);

  return (
    <>
      <GoogleAuthCredentialBridge />
      {!onAuthPage ? <GoogleOneTap /> : null}
    </>
  );
}
