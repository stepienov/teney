"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share2, Trash2, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";

import { BeachCard } from "@/components/beaches/beach-card";
import { AccessLevelBadge } from "@/components/lists/access-level-badge";
import { DeleteListConfirm } from "@/components/lists/delete-list-confirm";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { RatingAggregate } from "@/components/lists/rating-aggregate";
import { RatingControl } from "@/components/lists/rating-control";
import { ShareDialog } from "@/components/lists/share-dialog";
import {
  GuestPrompt,
  PageContent,
  PageEmpty,
  PageHeader,
  PageLoading,
  PageRoot,
  PageSection,
  pageCardGridClass,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Link } from "@/i18n/routing";
import { beachListItemToPoiDto } from "@/lib/api/beaches-search";
import {
  deleteList,
  fetchList,
  fetchListItems,
  removeListItem,
  removeListItemRating,
  setListItemRating,
  updateList,
} from "@/lib/api/user-lists";
import { ApiError } from "@/lib/api-client";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { useListAccess } from "@/hooks/use-list-access";
import { listQueryKeys } from "@/lib/query/lists";
import type { ListItemSort } from "@/lib/types/user-lists";

type ListDetailProps = {
  listId: number;
};

export function ListDetail({ listId }: ListDetailProps) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const resolveError = useApiErrorMessage("lists");
  const access = useListAccess(listId);

  const [sort, setSort] = useState<ListItemSort>("created_desc");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: listQueryKeys.list(listId),
    queryFn: () => fetchList(listId),
    enabled: status === "authenticated",
    retry: (count, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return count < 1;
    },
  });

  const itemsQuery = useQuery({
    queryKey: listQueryKeys.items(listId, locale, sort),
    queryFn: () => fetchListItems(listId, { locale, sort }),
    enabled: status === "authenticated" && listQuery.isSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (values: { name: string; description: string }) =>
      updateList(listId, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.list(listId) });
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      setEditOpen(false);
    },
    onError: (err) => setFormError(resolveError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteList(listId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (poiId: number) => removeListItem(listId, poiId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.items(listId, locale, sort) });
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.list(listId) });
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
    },
  });

  const rateMutation = useMutation({
    mutationFn: ({ poiId, rating }: { poiId: number; rating: 1 | 2 | 3 }) =>
      setListItemRating(listId, poiId, { rating }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.items(listId, locale, sort) });
    },
  });

  const clearRatingMutation = useMutation({
    mutationFn: (poiId: number) => removeListItemRating(listId, poiId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.items(listId, locale, sort) });
    },
  });

  if (status === "loading" || listQuery.isLoading) {
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

  if (listQuery.isError) {
    const isNotFound =
      listQuery.error instanceof ApiError && listQuery.error.status === 404;
    return (
      <PageRoot>
        <PageEmpty>
          <p className="text-sm text-muted-foreground">
            {isNotFound ? t("notFound") : resolveError(listQuery.error)}
          </p>
          <Button className="mt-4" variant="outline" render={<Link href="/lists" />}>
            {t("backToLists")}
          </Button>
        </PageEmpty>
      </PageRoot>
    );
  }

  const list = listQuery.data!;

  return (
    <PageRoot>
      <PageContent width="wide">
        <Link
          href="/lists"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToLists")}
        </Link>

        <PageHeader
          title={list.name}
          subtitle={
            [
              list.description,
              t("itemCount", { count: list.itemCount }),
            ]
              .filter(Boolean)
              .join(" · ") || undefined
          }
          className="mb-0"
          actions={
            <div className="flex flex-wrap gap-2">
              {!access.isLoading && !access.isOwner && (
                <AccessLevelBadge level={access.accessLevel as "VIEW" | "REVIEWER" | "EDIT"} />
              )}
              {access.canShare && (
                <Button variant="outline" className="gap-1.5" onClick={() => setShareOpen(true)}>
                  <Share2 className="size-4" aria-hidden />
                  {t("share.button")}
                </Button>
              )}
              {access.canEditMeta && (
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    {t("edit")}
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    {t("delete")}
                  </Button>
                </>
              )}
            </div>
          }
        />

        <PageSection title={t("itemsTitle")}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label htmlFor="list-sort" className="text-sm text-muted-foreground">
              {t("sortLabel")}
            </label>
            <SelectField
              id="list-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ListItemSort)}
              className="w-auto min-w-[10rem]"
            >
              <option value="created_desc">{t("sortCreatedDesc")}</option>
              <option value="rating_desc">{t("sortRatingDesc")}</option>
              <option value="rating_asc">{t("sortRatingAsc")}</option>
            </SelectField>
          </div>

          {itemsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loadingItems")}</p>
          ) : itemsQuery.isError ? (
            <p className="text-sm text-destructive">{resolveError(itemsQuery.error)}</p>
          ) : (itemsQuery.data ?? []).length === 0 ? (
            <PageEmpty>
              <p className="text-sm text-muted-foreground">{t("noItems")}</p>
              {access.canEditItems && (
                <Button className="mt-4" render={<Link href="/beaches" />}>
                  {t("browseBeaches")}
                </Button>
              )}
            </PageEmpty>
          ) : (
            <ul className={pageCardGridClass}>
              {(itemsQuery.data ?? []).map((item) => {
                const beach = beachListItemToPoiDto(item.poi);
                return (
                  <li key={item.poi.id} className="relative">
                    <BeachCard beach={beach} />
                    <div className="mt-2 flex items-center justify-between gap-2 px-1">
                      <div className="flex flex-col gap-1">
                        <RatingAggregate
                          aggregateRating={item.aggregateRating}
                          ratingsCount={item.ratingsCount}
                        />
                        {access.canRate && (
                          <RatingControl
                            value={item.myRating}
                            onChange={(rating) =>
                              rateMutation.mutateAsync({ poiId: item.poi.id, rating })
                            }
                            onClear={() => clearRatingMutation.mutateAsync(item.poi.id)}
                          />
                        )}
                      </div>
                      {access.canEditItems && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeItemMutation.mutate(item.poi.id)}
                          disabled={removeItemMutation.isPending}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {t("removeFromList")}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PageSection>
      </PageContent>

      <ListFormDialog
        key={editOpen ? `edit-${list.id}` : "closed"}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setFormError(null);
        }}
        initial={list}
        pending={updateMutation.isPending}
        error={formError}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />

      <DeleteListConfirm
        list={deleteOpen ? { id: list.id, name: list.name, itemCount: list.itemCount, createdAt: list.createdAt } : null}
        onClose={() => setDeleteOpen(false)}
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
          router.push("/lists");
        }}
      />

      {access.canShare && (
        <ShareDialog listId={listId} open={shareOpen} onClose={() => setShareOpen(false)} />
      )}
    </PageRoot>
  );
}
