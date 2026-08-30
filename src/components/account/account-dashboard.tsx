"use client";

import {
  Heart,
  ListChecks,
  LogOut,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState, useSyncExternalStore } from "react";

import {
  GuestPrompt,
  PageContent,
  PageFormField,
  PageFormStack,
  PageHeader,
  PageLoading,
  PageRoot,
  PageSection,
  pageCardGridClass,
  pageCardInteractiveClass,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Link } from "@/i18n/routing";
import { localeLabels, locales } from "@/i18n/routing";
import { ApiError } from "@/lib/api-client";
import { parseProblemJson, problemDetail } from "@/lib/api/problem-json";

const hubLinks = [
  { href: "/favorites", icon: Heart, titleKey: "cardFavoritesTitle", bodyKey: "cardFavoritesBody", ctaKey: "goToFavorites" },
  { href: "/lists", icon: ListChecks, titleKey: "cardListsTitle", bodyKey: "cardListsBody", ctaKey: "goToLists" },
  { href: "/friends", icon: Users, titleKey: "cardFriendsTitle", bodyKey: "cardFriendsBody", ctaKey: "goToFriends" },
  { href: "/groups", icon: UsersRound, titleKey: "cardGroupsTitle", bodyKey: "cardGroupsBody", ctaKey: "goToGroups" },
] as const;

type ProfileFormProps = {
  userEmail: string;
  initialLocale: string;
  onSave: (preferredLocale: string) => Promise<void>;
};

function ProfileForm({ userEmail, initialLocale, onSave }: ProfileFormProps) {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const [preferredLocale, setPreferredLocale] = useState(initialLocale);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePending, setProfilePending] = useState(false);

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfilePending(true);
    try {
      await onSave(preferredLocale);
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

  return (
    <form onSubmit={handleProfileSubmit}>
      <PageFormStack>
        <PageFormField>
          <Label htmlFor="profile-email">{tAuth("email")}</Label>
          <Input id="profile-email" type="email" value={userEmail} disabled />
        </PageFormField>

        <PageFormField>
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
        </PageFormField>

        <FieldError message={profileError ?? undefined} />

        <Button type="submit" disabled={profilePending}>
          {t("saveProfile")}
        </Button>
      </PageFormStack>
    </form>
  );
}

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

  const [logoutPending, setLogoutPending] = useState(false);

  if (!hasMounted || status === "loading") {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (status !== "authenticated" || user == null) {
    return (
      <GuestPrompt
        icon={User}
        title={t("guestTitle")}
        body={t("guestBody")}
        actions={
          <>
            <Button nativeButton={false} render={<Link href="/login" />}>
              {tAuth("loginLink")}
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/register" />}>
              {tAuth("registerLink")}
            </Button>
          </>
        }
      />
    );
  }

  async function handleProfileSave(preferredLocale: string) {
    await updateProfile({ preferredLocale });
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

  return (
    <PageRoot>
      <PageHeader
        title={t("title")}
        subtitle={user.email}
        actions={
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logoutPending}
            className="gap-1.5"
          >
            <LogOut className="size-4" aria-hidden />
            {t("logout")}
          </Button>
        }
      />

      <PageContent>
        <PageSection title={t("profileTitle")} description={t("profileBody")}>
          <ProfileForm
            key={user.email}
            userEmail={user.email}
            initialLocale={user.preferredLocale ?? locale}
            onSave={handleProfileSave}
          />
        </PageSection>

        <PageSection title={t("hubTitle")} description={t("hubBody")}>
          <ul className={pageCardGridClass}>
            {hubLinks.map(({ href, icon: Icon, titleKey, bodyKey, ctaKey }) => (
              <li key={href}>
                <Link href={href} className={`block h-full ${pageCardInteractiveClass}`}>
                  <Icon className="size-5 text-brand" aria-hidden />
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(bodyKey)}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-brand">
                    {t(ctaKey)} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PageSection>
      </PageContent>
    </PageRoot>
  );
}
