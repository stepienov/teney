"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/routing";
import { saveAuthReturnPath } from "@/lib/auth/return-url";

/** Persists the last non-auth route so post-login redirect can return there. */
export function AuthReturnUrlTracker() {
  const pathname = usePathname();

  useEffect(() => {
    saveAuthReturnPath(pathname);
  }, [pathname]);

  return null;
}
