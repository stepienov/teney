"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useMarkInvitesSeenOnMount } from "@/hooks/use-mark-invites-seen-on-mount";
import { InviteIncomingList } from "@/components/invites/invite-incoming-list";
import {
  GuestPrompt,
  PageContent,
  PageEmpty,
  PageFormField,
  PageFormStack,
  PageHeader,
  PageLoading,
  PageRoot,
  PageSection,
  PageTabBar,
  pageRowClass,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import {
  acceptInvite,
  declineInvite,
  fetchIncomingInvites,
} from "@/lib/api/invites";
import {
  fetchFriendRequests,
  fetchFriends,
  inviteFriend,
  removeFriend,
} from "@/lib/api/friends";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { friendQueryKeys } from "@/lib/query/friends";
import { inviteQueryKeys } from "@/lib/query/invites";
import type { FriendRequestDto } from "@/lib/types/friends";

type Tab = "friends" | "incoming" | "sent";

function tabFromSearchParam(value: string | null): Tab | null {
  if (value === "friends" || value === "incoming" || value === "sent") {
    return value;
  }
  if (value === "outgoing") {
    return "sent";
  }
  return null;
}

function outgoingRecipientLabel(req: FriendRequestDto): string {
  const name = req.counterpartDisplayName?.trim();
  const email = req.counterpartEmail?.trim();
  return name || email || "—";
}

export function FriendsDashboard() {
  const t = useTranslations("friends");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const resolveError = useApiErrorMessage("friends");

  const urlTab = tabFromSearchParam(searchParams.get("tab"));
  const [localTab, setLocalTab] = useState<Tab>("friends");
  const tab = urlTab ?? localTab;

  useEffect(() => {
    if (searchParams.get("tab") === "groups") {
      router.replace("/groups");
    }
  }, [searchParams, router]);

  useMarkInvitesSeenOnMount(["FRIEND"]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const friendsQuery = useQuery({
    queryKey: friendQueryKeys.friends(),
    queryFn: fetchFriends,
    enabled: status === "authenticated",
  });

  const incomingInvitesQuery = useQuery({
    queryKey: inviteQueryKeys.incoming("FRIEND", 0, 50),
    queryFn: () => fetchIncomingInvites(0, 50, "FRIEND"),
    enabled: status === "authenticated" && tab === "incoming",
  });

  const outgoingQuery = useQuery({
    queryKey: friendQueryKeys.requests("outgoing"),
    queryFn: () => fetchFriendRequests("outgoing"),
    enabled: status === "authenticated" && tab === "sent",
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
  };

  const inviteMutation = useMutation({
    mutationFn: () => inviteFriend({ email: inviteEmail.trim() }),
    onSuccess: () => {
      setInviteEmail("");
      setInviteError(null);
      setInviteSuccess(true);
      invalidateAll();
    },
    onError: (err) => {
      setInviteSuccess(false);
      setInviteError(resolveError(err));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: (res) => {
      invalidateAll();
      if (res.targetPath) {
        router.push(res.targetPath);
      }
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineInvite,
    onSuccess: invalidateAll,
  });

  const inviteActionPending =
    acceptMutation.isPending || declineMutation.isPending;

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: invalidateAll,
  });

  if (status === "loading") {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (status !== "authenticated") {
    return (
      <GuestPrompt
        icon={Users}
        title={t("guestTitle")}
        body={t("guestBody")}
        actions={
          <Button nativeButton={false} render={<Link href="/auth" />}>
            {t("authContinue")}
          </Button>
        }
      />
    );
  }

  const outgoing = outgoingQuery.data ?? [];
  const incomingInvites = incomingInvitesQuery.data?.content ?? [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends", label: t("tabFriends") },
    { key: "incoming", label: t("tabIncoming") },
    { key: "sent", label: t("tabSent") },
  ];

  return (
    <PageRoot>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <PageContent>
        <PageSection title={t("inviteTitle")}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInviteSuccess(false);
              inviteMutation.mutate();
            }}
          >
            <PageFormStack>
              <PageFormField>
                <Label htmlFor="invite-email">{t("inviteEmail")}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t("inviteEmailPlaceholder")}
                  required
                  disabled={inviteMutation.isPending}
                />
              </PageFormField>
              <Button
                type="submit"
                className="gap-1.5"
                disabled={inviteMutation.isPending}
              >
                <UserPlus className="size-4" aria-hidden />
                {t("inviteSubmit")}
              </Button>
              {inviteSuccess && (
                <p className="text-sm text-brand">{t("inviteSuccess")}</p>
              )}
              <FieldError message={inviteError ?? undefined} />
            </PageFormStack>
          </form>
        </PageSection>

        <PageTabBar
          className="mb-0"
          tabs={tabs}
          activeKey={tab}
          onChange={(key) => setLocalTab(key as Tab)}
        />

        {tab === "friends" && (
          <section key="friends">
            {friendsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            ) : (friendsQuery.data ?? []).length === 0 ? (
              <PageEmpty>
                <p className="text-sm text-muted-foreground">{t("emptyFriends")}</p>
              </PageEmpty>
            ) : (
              <ul className="space-y-2">
                {friendsQuery.data!.map((friend) => (
                  <li
                    key={friend.userId}
                    className={`flex items-center justify-between ${pageRowClass}`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {friend.displayName ?? friend.email}
                      </p>
                      {friend.displayName && (
                        <p className="text-xs text-muted-foreground">{friend.email}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeFriendMutation.mutate(friend.userId)}
                      disabled={removeFriendMutation.isPending}
                    >
                      <UserMinus className="size-3.5" aria-hidden />
                      {t("remove")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "incoming" && (
          <section key="incoming">
            <InviteIncomingList
              invites={incomingInvites}
              isLoading={incomingInvitesQuery.isLoading}
              loadingMessage={t("loading")}
              emptyMessage={t("emptyIncoming")}
              onAccept={(token) => acceptMutation.mutate(token)}
              onDecline={(token) => declineMutation.mutate(token)}
              pending={inviteActionPending}
            />
          </section>
        )}

        {tab === "sent" && (
          <section key="sent">
            {outgoingQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            ) : outgoing.length === 0 ? (
              <PageEmpty>
                <p className="text-sm text-muted-foreground">{t("emptySent")}</p>
              </PageEmpty>
            ) : (
              <ul className="space-y-2">
                {outgoing.map((req) => (
                  <li
                    key={req.requestId}
                    className={`flex items-center justify-between ${pageRowClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-sm font-medium">
                          {outgoingRecipientLabel(req)}
                        </p>
                        {req.counterpartDisplayName && req.counterpartEmail ? (
                          <p className="text-xs text-muted-foreground">
                            {req.counterpartEmail}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {req.status === "PENDING_REGISTRATION"
                            ? t("statusPendingRegistration")
                            : t("statusPending")}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </PageContent>
    </PageRoot>
  );
}
