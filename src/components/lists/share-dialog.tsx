"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AccessLevelSelect } from "@/components/lists/access-level-select";
import { AccessLevelBadge } from "@/components/lists/access-level-badge";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  createShares,
  deleteShare,
  fetchShares,
  updateShare,
} from "@/lib/api/user-lists";
import { fetchFriendGroups, fetchFriends } from "@/lib/api/friends";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { friendQueryKeys } from "@/lib/query/friends";
import { listQueryKeys } from "@/lib/query/lists";
import type { ListAccessLevel, ListShareDto } from "@/lib/types/user-lists";

type ShareDialogProps = {
  listId: number;
  open: boolean;
  onClose: () => void;
};

type ShareTab = "user" | "group" | "email";

export function ShareDialog({ listId, open, onClose }: ShareDialogProps) {
  const t = useTranslations("lists.share");
  const queryClient = useQueryClient();
  const resolveError = useApiErrorMessage("lists");

  const [tab, setTab] = useState<ShareTab>("user");
  const [accessLevel, setAccessLevel] = useState<ListAccessLevel>("VIEW");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [emails, setEmails] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sharesQuery = useQuery({
    queryKey: listQueryKeys.shares(listId),
    queryFn: () => fetchShares(listId),
    enabled: open,
  });

  const friendsQuery = useQuery({
    queryKey: friendQueryKeys.friends(),
    queryFn: fetchFriends,
    enabled: open,
  });

  const groupsQuery = useQuery({
    queryKey: friendQueryKeys.groups(),
    queryFn: fetchFriendGroups,
    enabled: open,
  });

  const shareMutation = useMutation({
    mutationFn: () => {
      if (tab === "user") {
        return createShares(listId, {
          principalType: "USER",
          targetUserId: Number(targetUserId),
          accessLevel,
        });
      }
      if (tab === "group") {
        return createShares(listId, {
          principalType: "GROUP",
          targetGroupId: Number(targetGroupId),
          accessLevel,
        });
      }
      const emailList = emails
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean);
      return createShares(listId, {
        principalType: "EMAIL",
        emails: emailList,
        accessLevel,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.shares(listId) });
      setError(null);
      setEmails("");
    },
    onError: (err) => setError(resolveError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      shareId,
      level,
    }: {
      shareId: number;
      level: ListAccessLevel;
    }) => updateShare(listId, shareId, { accessLevel: level }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.shares(listId) });
    },
    onError: (err) => setError(resolveError(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: (shareId: number) => deleteShare(listId, shareId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.shares(listId) });
    },
    onError: (err) => setError(resolveError(err)),
  });

  if (!open) {
    return null;
  }

  function shareLabel(share: ListShareDto): string {
    if (share.principalType === "USER" && share.targetUserId != null) {
      const friend = friendsQuery.data?.find((f) => f.userId === share.targetUserId);
      return friend?.displayName ?? friend?.email ?? `User #${share.targetUserId}`;
    }
    if (share.principalType === "GROUP" && share.targetGroupId != null) {
      const group = groupsQuery.data?.find((g) => g.id === share.targetGroupId);
      return group?.name ?? `Group #${share.targetGroupId}`;
    }
    if (share.principalType === "EMAIL" && share.inviteEmail) {
      return share.inviteEmail;
    }
    return t("unknownRecipient");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="border-b border-border p-5">
          <h2 id="share-dialog-title" className="text-lg font-semibold text-foreground">
            {t("title")}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex gap-2">
            {(["user", "group", "email"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  tab === key
                    ? "bg-brand-muted text-brand"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setTab(key)}
              >
                {key === "user" && <User className="size-3.5" aria-hidden />}
                {key === "group" && <Users className="size-3.5" aria-hidden />}
                {key === "email" && <Mail className="size-3.5" aria-hidden />}
                {key === "user" && t("tabUser")}
                {key === "group" && t("tabGroup")}
                {key === "email" && t("tabEmail")}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="share-access">{t("accessLevel")}</Label>
              <AccessLevelSelect
                id="share-access"
                value={accessLevel}
                onChange={setAccessLevel}
              />
            </div>

            {tab === "user" && (
              <div className="space-y-1.5">
                <Label htmlFor="share-user">{t("selectFriend")}</Label>
                <select
                  id="share-user"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                >
                  <option value="">{t("selectFriendPlaceholder")}</option>
                  {(friendsQuery.data ?? []).map((f) => (
                    <option key={f.userId} value={f.userId}>
                      {f.displayName ?? f.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tab === "group" && (
              <div className="space-y-1.5">
                <Label htmlFor="share-group">{t("selectGroup")}</Label>
                <select
                  id="share-group"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                >
                  <option value="">{t("selectGroupPlaceholder")}</option>
                  {(groupsQuery.data ?? []).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tab === "email" && (
              <div className="space-y-1.5">
                <Label htmlFor="share-emails">{t("emails")}</Label>
                <Input
                  id="share-emails"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder={t("emailsPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("emailsHint")}</p>
              </div>
            )}

            <Button
              type="button"
              disabled={
                shareMutation.isPending ||
                (tab === "user" && !targetUserId) ||
                (tab === "group" && !targetGroupId) ||
                (tab === "email" && emails.trim().length === 0)
              }
              onClick={() => shareMutation.mutate()}
            >
              {t("share")}
            </Button>
          </div>

          <FieldError message={error ?? undefined} />

          <div>
            <h3 className="text-sm font-medium text-foreground">{t("activeShares")}</h3>
            {sharesQuery.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
            ) : (sharesQuery.data ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t("noShares")}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {(sharesQuery.data ?? [])
                  .filter((s) => s.status !== "REVOKED")
                  .map((share) => (
                    <li
                      key={share.id}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{shareLabel(share)}</p>
                        <p className="text-xs text-muted-foreground">
                          {share.principalType}
                          {share.status === "PENDING" && ` · ${t("pending")}`}
                        </p>
                      </div>
                      {share.status === "ACTIVE" && share.principalType !== "EMAIL" ? (
                        <AccessLevelSelect
                          value={share.accessLevel}
                          onChange={(level) =>
                            updateMutation.mutate({ shareId: share.id, level })
                          }
                          disabled={updateMutation.isPending}
                        />
                      ) : (
                        <AccessLevelBadge level={share.accessLevel} />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => revokeMutation.mutate(share.id)}
                        disabled={revokeMutation.isPending}
                        aria-label={t("revoke")}
                      >
                        <Trash2 className="size-3.5 text-destructive" aria-hidden />
                      </Button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
