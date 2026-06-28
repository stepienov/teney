"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, UsersRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { InviteIncomingList } from "@/components/invites/invite-incoming-list";
import { useMarkInvitesSeenOnMount } from "@/hooks/use-mark-invites-seen-on-mount";
import {
  GuestPrompt,
  PageContent,
  PageFormStack,
  PageHeader,
  PageLoading,
  PageRoot,
  PageSection,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import {
  acceptInvite,
  declineInvite,
  fetchIncomingInvites,
} from "@/lib/api/invites";
import {
  addGroupMember,
  createFriendGroup,
  deleteFriendGroup,
  fetchFriendGroups,
  fetchFriends,
  fetchGroupMembers,
  removeGroupMember,
  renameFriendGroup,
} from "@/lib/api/friends";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { friendQueryKeys } from "@/lib/query/friends";
import { inviteQueryKeys } from "@/lib/query/invites";
import type { FriendGroupDto } from "@/lib/types/friends";

export function GroupsDashboard() {
  const t = useTranslations("friends");
  const tShell = useTranslations("shell");
  const tInvites = useTranslations("invites");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const resolveError = useApiErrorMessage("friends");

  useMarkInvitesSeenOnMount(["GROUP"]);

  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<FriendGroupDto | null>(null);
  const [renameName, setRenameName] = useState("");

  const friendsQuery = useQuery({
    queryKey: friendQueryKeys.friends(),
    queryFn: fetchFriends,
    enabled: status === "authenticated",
  });

  const groupInvitesQuery = useQuery({
    queryKey: inviteQueryKeys.incoming("GROUP", 0, 50),
    queryFn: () => fetchIncomingInvites(0, 50, "GROUP"),
    enabled: status === "authenticated",
  });

  const groupsQuery = useQuery({
    queryKey: friendQueryKeys.groups(),
    queryFn: fetchFriendGroups,
    enabled: status === "authenticated",
  });

  const membersQuery = useQuery({
    queryKey: friendQueryKeys.groupMembers(selectedGroup?.id ?? 0),
    queryFn: () => fetchGroupMembers(selectedGroup!.id),
    enabled: selectedGroup != null,
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
  };

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

  const createGroupMutation = useMutation({
    mutationFn: () => createFriendGroup({ name: newGroupName.trim() }),
    onSuccess: () => {
      setNewGroupName("");
      setGroupError(null);
      invalidateAll();
    },
    onError: (err) => setGroupError(resolveError(err)),
  });

  const renameGroupMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameFriendGroup(id, { name }),
    onSuccess: invalidateAll,
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteFriendGroup,
    onSuccess: () => {
      setSelectedGroup(null);
      invalidateAll();
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      addGroupMember(groupId, userId),
    onSuccess: invalidateAll,
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      removeGroupMember(groupId, userId),
    onSuccess: invalidateAll,
  });

  if (status === "loading") {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (status !== "authenticated") {
    return (
      <GuestPrompt
        icon={UsersRound}
        title={t("groupsGuestTitle")}
        body={t("groupsGuestBody")}
        actions={
          <Button nativeButton={false} render={<Link href="/auth" />}>
            {t("authContinue")}
          </Button>
        }
      />
    );
  }

  const groupInvites = groupInvitesQuery.data?.content ?? [];

  return (
    <PageRoot>
      <PageHeader title={tShell("groups")} subtitle={t("groupsSubtitle")} />

      <PageContent>
        <PageSection title={t("groupInvitesTitle")}>
          <InviteIncomingList
            invites={groupInvites}
            isLoading={groupInvitesQuery.isLoading}
            loadingMessage={t("loading")}
            emptyMessage={tInvites("emptyGroupInvites")}
            onAccept={(token) => acceptMutation.mutate(token)}
            onDecline={(token) => declineMutation.mutate(token)}
            pending={inviteActionPending}
          />
        </PageSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title={t("groupsTitle")}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createGroupMutation.mutate();
              }}
            >
              <PageFormStack>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t("groupNamePlaceholder")}
                  maxLength={120}
                  required
                  disabled={createGroupMutation.isPending}
                />
                <Button type="submit" disabled={createGroupMutation.isPending}>
                  {t("createGroup")}
                </Button>
                {groupError ? (
                  <p className="text-sm text-destructive">{groupError}</p>
                ) : null}
              </PageFormStack>
            </form>
            <ul className="mt-4 space-y-2">
              {(groupsQuery.data ?? []).map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      selectedGroup?.id === group.id
                        ? "border-brand bg-brand-muted text-brand"
                        : "border-border hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedGroup(group);
                      setRenameName(group.name);
                    }}
                  >
                    {group.name}
                    <span className="ml-2 text-muted-foreground">
                      ({t("memberCount", { count: group.memberCount })})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </PageSection>

          {selectedGroup && (
            <PageSection title={t("manageGroup")}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  renameGroupMutation.mutate({
                    id: selectedGroup.id,
                    name: renameName.trim(),
                  });
                }}
              >
                <PageFormStack>
                  <Input
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    disabled={renameGroupMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={renameGroupMutation.isPending}
                  >
                    {t("rename")}
                  </Button>
                </PageFormStack>
              </form>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-4"
                onClick={() => deleteGroupMutation.mutate(selectedGroup.id)}
                disabled={deleteGroupMutation.isPending}
              >
                {t("deleteGroup")}
              </Button>

              <h4 className="mt-6 text-sm font-medium">{t("members")}</h4>
              {membersQuery.isLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {(membersQuery.data ?? []).map((m) => (
                    <li
                      key={m.userId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{m.displayName ?? m.email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeMemberMutation.mutate({
                            groupId: selectedGroup.id,
                            userId: m.userId,
                          })
                        }
                      >
                        <X className="size-3.5" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <h4 className="mt-6 text-sm font-medium">{t("addMember")}</h4>
              <ul className="mt-2 space-y-1">
                {(friendsQuery.data ?? [])
                  .filter(
                    (f) =>
                      !(membersQuery.data ?? []).some((m) => m.userId === f.userId),
                  )
                  .map((friend) => (
                    <li key={friend.userId}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                        onClick={() =>
                          addMemberMutation.mutate({
                            groupId: selectedGroup.id,
                            userId: friend.userId,
                          })
                        }
                      >
                        <User className="size-3.5" aria-hidden />
                        {friend.displayName ?? friend.email}
                      </button>
                    </li>
                  ))}
              </ul>
            </PageSection>
          )}
        </div>
      </PageContent>
    </PageRoot>
  );
}
