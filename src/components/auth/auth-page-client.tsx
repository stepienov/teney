"use client";

import { useTranslations } from "next-intl";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";

type AuthPageClientProps = {
  googleClientId?: string;
  mode: "login" | "register";
};

export function AuthPageClient({ googleClientId, mode }: AuthPageClientProps) {
  const t = useTranslations("auth");
  const isLogin = mode === "login";

  return (
    <AuthScreen
      title={isLogin ? t("loginTitle") : t("registerTitle")}
      subtitle={isLogin ? t("loginSubtitle") : t("registerSubtitle")}
    >
      <AuthForm emailMode={mode} googleClientId={googleClientId} />
    </AuthScreen>
  );
}
