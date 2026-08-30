"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { useRegisterGoogleCredentialHandler } from "@/components/auth/google-identity-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useAuthOperationLoading } from "@/components/providers/auth-operation-loading";
import { useNavigationRouter } from "@/components/providers/navigation-loading";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api-client";
import { parseProblemJson, problemDetail } from "@/lib/api/problem-json";
import { consumeAuthReturnPath } from "@/lib/auth/return-url";
import {
  detectBrowserAppLocale,
  detectBrowserCountryCode,
} from "@/lib/browser-user-preferences";
import { cn } from "@/lib/utils";

import { GoogleSignInButton } from "./google-sign-in-button";

type AuthFormProps = {
  /** Email/password only — Google is always one button for login + registration. */
  emailMode?: "login" | "register";
  googleClientId?: string;
  className?: string;
};

export function AuthForm({
  emailMode = "login",
  googleClientId,
  className,
}: AuthFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useNavigationRouter();
  const { login, register, loginWithGoogle } = useAuth();
  const { startAuthOperation, stopAuthOperation } = useAuthOperationLoading();

  const browserPrefs = useMemo(
    () => ({
      locale: detectBrowserAppLocale(locale as AppLocale),
      countryCode: detectBrowserCountryCode(),
    }),
    [locale],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    startAuthOperation(emailMode === "login" ? "login" : "register");

    try {
      if (emailMode === "login") {
        await login({ email, password }, locale);
      } else {
        await register({
          email,
          password,
          preferredLocale: browserPrefs.locale,
          countryCode: browserPrefs.countryCode,
        });
      }
      router.push(consumeAuthReturnPath("/"));
    } catch (err) {
      stopAuthOperation();
      if (err instanceof ApiError) {
        const problem = parseProblemJson(err.bodyText);
        setError(problemDetail(problem, t("genericError")));
      } else {
        setError(t("genericError"));
      }
      setPending(false);
    }
  }

  const handleGoogle = useCallback(
    async (idToken: string) => {
      setError(null);
      setPending(true);
      startAuthOperation("google");
      try {
        await loginWithGoogle(idToken, {
          preferredLocale: browserPrefs.locale,
          countryCode: browserPrefs.countryCode,
        });
        router.push(consumeAuthReturnPath("/"));
      } catch (err) {
        stopAuthOperation();
        if (err instanceof ApiError) {
          const problem = parseProblemJson(err.bodyText);
          setError(problemDetail(problem, t("genericError")));
        } else {
          setError(t("genericError"));
        }
        setPending(false);
      }
    },
    [
      browserPrefs.countryCode,
      browserPrefs.locale,
      loginWithGoogle,
      router,
      startAuthOperation,
      stopAuthOperation,
      t,
    ],
  );

  useRegisterGoogleCredentialHandler(handleGoogle);

  return (
    <div className={cn("space-y-6", className)}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">{t("email")}</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="auth-password">{t("password")}</Label>
          <PasswordInput
            id="auth-password"
            autoComplete={emailMode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
          {emailMode === "register" && (
            <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
          )}
        </div>

        <FieldError message={error ?? undefined} />

        <Button type="submit" className="w-full" disabled={pending}>
          {emailMode === "login" ? t("loginSubmit") : t("registerSubmit")}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <p className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-card px-2">{t("orUse")}</span>
        </p>
      </div>

      <GoogleSignInButton
        clientId={googleClientId}
        disabled={pending}
        label={t("continueWithGoogle")}
      />
      {emailMode === "register" && (
        <p className="text-center text-xs text-muted-foreground">
          {t("googleOneButtonHint")}
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {emailMode === "login" ? t("noAccount") : t("hasAccount")}{" "}
        <Link
          href={emailMode === "login" ? "/register" : "/login"}
          className="font-medium text-brand hover:underline"
        >
          {emailMode === "login" ? t("registerLink") : t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
