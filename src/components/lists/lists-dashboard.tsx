"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListPlus, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";

import { InviteIncomingList } from "@/components/invites/invite-incoming-list";
import { useMarkInvitesSeenOnMount } from "@/hooks/use-mark-invites-seen-on-mount";
import { DeleteListConfirm } from "@/components/lists/delete-list-confirm";
import { ListCard } from "@/components/lists/list-card";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { AccessLevelBadge } from "@/components/lists/access-level-badge";
import {
  GuestPrompt,
  PageContent,
  PageEmpty,
  PageHeader,
  PageLoading,
  PageRoot,
  PageTabBar,
  pageCardGridClass,
  pageCardInteractiveClass,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  acceptInvite,
  declineInvite,
  fetchIncomingInvites,
} from "@/lib/api/invites";
import {
  createList,
  deleteList,
  fetchMyLists,
  fetchSharedWithMe,
  updateList,
} from "@/lib/api/user-lists";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { inviteQueryKeys } from "@/lib/query/invites";
import { listQueryKeys } from "@/lib/query/lists";
import type { UserListSummary } from "@/lib/types/user-lists";

const PAGE_SIZE = 20;

export function ListsDashboard() {
  const t = useTranslations("lists");
  const tInvites = useTranslations("invites");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const resolveError = useApiErrorMessage("lists");

  useMarkInvitesSeenOnMount(["LIST"]);

  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"mine" | "shared" | "invites">("mine");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserListSummary | null>(null);
  const [deleting, setDeleting] = useState<UserListSummary | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const myListsQuery = useQuery({
    queryKey: listQueryKeys.myLists(page, PAGE_SIZE),
    queryFn: () => fetchMyLists(page, PAGE_SIZE),
    enabled: status === "authenticated" && tab === "mine",
  });

  const sharedQuery = useQuery({
    queryKey: listQueryKeys.sharedWithMe(page, PAGE_SIZE),
    queryFn: () => fetchSharedWithMe(page, PAGE_SIZE),
    enabled: status === "authenticated" && tab === "shared",
  });

  const listInvitesQuery = useQuery({
    queryKey: inviteQueryKeys.incoming("LIST", 0, 50),
    queryFn: () => fetchIncomingInvites(0, 50, "LIST"),
    enabled: status === "authenticated" && tab === "invites",
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      if (res.targetPath) {
        router.push(res.targetPath);
      }
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineInvite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
    },
  });

  const inviteActionPending =
    acceptMutation.isPending || declineMutation.isPending;

  const createMutation = useMutation({
    mutationFn: createList,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      setFormOpen(false);
      setFormError(null);
    },
    onError: (err) => setFormError(resolveError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: number; name: string; description: string }) =>
      updateList(id, { name, description: description || undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      setEditing(null);
      setFormError(null);
    },
    onError: (err) => setFormError(resolveError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteList(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      setDeleting(null);
    },
    onError: (err) => setFormError(resolveError(err)),
  });

  if (status === "loading") {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (status !== "authenticated") {
    return (
      <GuestPrompt
        icon={User}
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

  const activeQuery = tab === "mine" ? myListsQuery : tab === "shared" ? sharedQuery : null;
  const lists = activeQuery?.data?.content ?? [];
  const totalPages = activeQuery?.data?.totalPages ?? 0;
  const listInvites = listInvitesQuery.data?.content ?? [];

  return (
    <PageRoot>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          tab === "mine" ? (
            <Button className="gap-1.5" onClick={() => setFormOpen(true)}>
              <ListPlus className="size-4" aria-hidden />
              {t("create")}
            </Button>
          ) : undefined
        }
      />

      <PageContent width="wide">
        <PageTabBar
          className="mb-0"
          tabs={[
            { key: "mine", label: t("tabMine") },
            { key: "shared", label: t("tabShared") },
            { key: "invites", label: t("tabInvites") },
          ]}
          activeKey={tab}
          onChange={(key) => {
            setTab(key as "mine" | "shared" | "invites");
            setPage(0);
          }}
        />

        {tab === "invites" ? (
          <InviteIncomingList
            invites={listInvites}
            isLoading={listInvitesQuery.isLoading}
            loadingMessage={t("loading")}
            emptyMessage={tInvites("emptyListInvites")}
            onAccept={(token) => acceptMutation.mutate(token)}
            onDecline={(token) => declineMutation.mutate(token)}
            pending={inviteActionPending}
          />
        ) : activeQuery!.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : activeQuery!.isError ? (
          <p className="text-sm text-destructive">{resolveError(activeQuery!.error)}</p>
        ) : lists.length === 0 ? (
          <PageEmpty>
            <p className="text-sm text-muted-foreground">
              {tab === "mine" ? t("emptyMine") : t("emptyShared")}
            </p>
            {tab === "mine" && (
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                {t("create")}
              </Button>
            )}
          </PageEmpty>
        ) : tab === "mine" ? (
          <ul className={pageCardGridClass}>
            {(lists as UserListSummary[]).map((list) => (
              <li key={list.id}>
                <ListCard
                  list={list}
                  onEdit={(l) => {
                    setFormError(null);
                    setEditing(l);
                  }}
                  onDelete={setDeleting}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className={pageCardGridClass}>
            {sharedQuery.data!.content.map((list) => (
              <li key={list.id}>
                <Link
                  href={`/lists/${list.id}`}
                  className={`block ${pageCardInteractiveClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground">{list.name}</h3>
                    <AccessLevelBadge level={list.accessLevel} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("sharedBy", { name: list.ownerDisplayName })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("itemCount", { count: list.itemCount })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("prev")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("page", { current: page + 1, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("next")}
            </Button>
          </div>
        )}
      </PageContent>

      <ListFormDialog
        key={editing?.id ?? (formOpen ? "create" : "closed")}
        open={formOpen || editing != null}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setFormError(null);
        }}
        initial={editing}
        pending={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onSubmit={async (values) => {
          setFormError(null);
          if (editing) {
            await updateMutation.mutateAsync({
              id: editing.id,
              ...values,
            });
          } else {
            const created = await createMutation.mutateAsync(values);
            router.push(`/lists/${created.id}`);
          }
        }}
      />

      <DeleteListConfirm
        list={deleting}
        onClose={() => setDeleting(null)}
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleting) {
            await deleteMutation.mutateAsync(deleting.id);
          }
        }}
      />
    </PageRoot>
  );
}
