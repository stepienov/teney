"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart, LogOut, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMemo, useState, useEffect, useSyncExternalStore } from "react";

import { BeachCard } from "@/components/beaches/beach-card";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Link } from "@/i18n/routing";
import { beachListItemToPoiDto } from "@/lib/api/beaches-search";
import { fetchFavorites } from "@/lib/api/user-me";
import { localeLabels, locales } from "@/i18n/routing";
import { userQueryKeys } from "@/lib/query/user";
import { ApiError } from "@/lib/api-client";
import { parseProblemJson, problemDetail } from "@/lib/api/problem-json";
import { getCountrySelectOptions, isUserCountryCode } from "@/lib/user-countries";

export function AccountDashboard() {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { status, user, logout, updateProfile } = useAuth();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [preferredLocale, setPreferredLocale] = useState(
    user?.preferredLocale ?? locale,
  );
  const [countryCode, setCountryCode] = useState(user?.countryCode ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePending, setProfilePending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const countryOptions = useMemo(
    () => getCountrySelectOptions(locale),
    [locale],
  );

  useEffect(() => {
    if (user != null) {
      setPreferredLocale(user.preferredLocale ?? locale);
      const stored = user.countryCode ?? "";
      setCountryCode(
        stored && isUserCountryCode(stored) ? stored : "",
      );
    }
  }, [user, locale]);

  const favoritesQuery = useQuery({
    queryKey: userQueryKeys.favorites(locale),
    queryFn: () => fetchFavorites(locale),
    enabled: status === "authenticated",
  });

  if (!hasMounted || status === "loading") {
    return (
      <div className="px-4 py-8 text-sm text-muted-foreground sm:px-8 sm:py-10">
        {t("loading")}
      </div>
    );
  }

  if (status !== "authenticated" || user == null) {
    return (
      <div className="px-4 py-8 sm:px-8 sm:py-10">
        <div className="max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
          <User className="size-10 text-muted-foreground" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {t("guestTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("guestBody")}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button nativeButton={false} render={<Link href="/login" />}>
              {tAuth("loginLink")}
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/register" />}>
              {tAuth("registerLink")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfilePending(true);
    try {
      await updateProfile({
        preferredLocale,
        countryCode: countryCode.trim() || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const problem = parseProblemJson(err.bodyText);
        setProfileError(problemDetail(problem, t("profileSaveError")));
      } else {
        setProfileError(t("profileSaveError"));
      }
    } finally {
      setProfilePending(false);
    }
  }

  async function handleLogout() {
    setLogoutPending(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setLogoutPending(false);
    }
  }

  const favorites = Array.isArray(favoritesQuery.data) ? favoritesQuery.data : [];

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={logoutPending}
          className="gap-1.5 self-start"
        >
          <LogOut className="size-4" aria-hidden />
          {t("logout")}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            {t("profileTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("profileBody")}</p>

          <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">{tAuth("email")}</Label>
              <Input id="profile-email" type="email" value={user.email} disabled />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-locale">{t("preferredLocale")}</Label>
              <SelectField
                id="profile-locale"
                value={preferredLocale}
                onChange={(e) => setPreferredLocale(e.target.value)}
                disabled={profilePending}
              >
                {locales.map((code) => (
                  <option key={code} value={code}>
                    {localeLabels[code]}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-country">{t("country")}</Label>
              <SelectField
                id="profile-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={profilePending}
              >
                <option value="">{t("countryNotSet")}</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </div>

            <FieldError message={profileError ?? undefined} />

            <Button type="submit" disabled={profilePending}>
              {t("saveProfile")}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-md bg-brand-muted px-3 py-2 text-sm text-brand">
            <Heart className="size-4 fill-current" aria-hidden />
            <span>{t("favoriteCount", { count: user.favoriteCount })}</span>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            {t("favoritesTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("favoritesBody")}</p>

          {favoritesQuery.isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">{t("loadingFavorites")}</p>
          ) : favorites.length === 0 ? (
            <div className="mt-6 rounded-md border border-dashed border-border px-4 py-8 text-center">
              <Heart className="mx-auto size-8 text-muted-foreground/60" aria-hidden />
              <p className="mt-3 text-sm text-muted-foreground">{t("noFavorites")}</p>
              <Button className="mt-4" nativeButton={false} render={<Link href="/beaches" />}>
                {t("browseBeaches")}
              </Button>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {favorites.map((item) => {
                const beach = beachListItemToPoiDto(item);
                return (
                  <li key={item.id}>
                    <BeachCard beach={beach} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
