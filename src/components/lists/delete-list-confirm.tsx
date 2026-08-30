"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { UserListSummary } from "@/lib/types/user-lists";

type DeleteListConfirmProps = {
  list: UserListSummary | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  pending?: boolean;
};

export function DeleteListConfirm({
  list,
  onClose,
  onConfirm,
  pending = false,
}: DeleteListConfirmProps) {
  const t = useTranslations("lists");

  if (list == null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-list-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 id="delete-list-title" className="text-lg font-semibold text-foreground">
          {t("confirmDeleteTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("confirmDeleteBody", { name: list.name })}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            {t("form.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
