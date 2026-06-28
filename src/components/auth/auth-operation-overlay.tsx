"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export type AuthOperation = "login" | "register" | "google";

type AuthOperationOverlayProps = {
  operation: AuthOperation | null;
};

const messageKey: Record<
  AuthOperation,
  "operationLogin" | "operationRegister" | "operationGoogle"
> = {
  login: "operationLogin",
  register: "operationRegister",
  google: "operationGoogle",
};

export function AuthOperationOverlay({ operation }: AuthOperationOverlayProps) {
  const t = useTranslations("auth");

  if (operation == null) {
    return null;
  }

  const label = t(messageKey[operation]);

  return (
    <div
      className="fixed inset-0 z-[210] flex flex-col items-center justify-center gap-3 bg-background/55 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border">
        <Loader2 className="size-7 animate-spin text-brand" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
    </div>
  );
}
