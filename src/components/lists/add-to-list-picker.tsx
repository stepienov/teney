"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import {
  addListItem,
  createList,
  fetchMyLists,
} from "@/lib/api/user-lists";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { listQueryKeys } from "@/lib/query/lists";

type AddToListPickerProps = {
  poiId: number;
  onClose: () => void;
};

export function AddToListPicker({ poiId, onClose }: AddToListPickerProps) {
  const t = useTranslations("lists");
  const queryClient = useQueryClient();
  const resolveError = useApiErrorMessage("lists");
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const listsQuery = useQuery({
    queryKey: listQueryKeys.myLists(0, 100),
    queryFn: () => fetchMyLists(0, 100),
  });

  const addMutation = useMutation({
    mutationFn: ({ listId }: { listId: number }) => addListItem(listId, poiId),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      const list = listsQuery.data?.content.find((l) => l.id === listId);
      setSuccess(list?.name ?? t("addedToList"));
      setError(null);
    },
    onError: (err) => setError(resolveError(err)),
  });

  const createMutation = useMutation({
    mutationFn: createList,
    onSuccess: async (created) => {
      await addListItem(created.id, poiId);
      void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
      setCreateOpen(false);
      setSuccess(created.name);
    },
    onError: (err) => setError(resolveError(err)),
  });

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-list-title"
      >
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-lg">
          <h2 id="add-to-list-title" className="text-base font-semibold text-foreground">
            {t("pickList")}
          </h2>

          {success ? (
            <p className="mt-4 text-sm text-brand">{t("addedToListNamed", { name: success })}</p>
          ) : listsQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
          ) : (
            <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto">
              {(listsQuery.data?.content ?? []).map((list) => (
                <li key={list.id}>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                    disabled={addMutation.isPending}
                    onClick={() => addMutation.mutate({ listId: list.id })}
                  >
                    {list.name}
                    <span className="ml-2 text-muted-foreground">
                      ({t("itemCount", { count: list.itemCount })})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <FieldError message={error ?? undefined} />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {!success && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                {t("createAndAdd")}
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {success ? t("form.close") : t("form.cancel")}
            </Button>
          </div>
        </div>
      </div>

      <ListFormDialog
        key="create-and-add"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        pending={createMutation.isPending}
        error={error}
        onSubmit={async (values) => {
          setError(null);
          await createMutation.mutateAsync(values);
        }}
      />
    </>
  );
}
