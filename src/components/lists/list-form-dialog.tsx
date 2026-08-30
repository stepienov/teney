"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

type ListFormDialogProps = {
  open: boolean;
  onClose: () => void;
  initial?: { name: string; description?: string | null } | null;
  onSubmit: (values: { name: string; description: string }) => Promise<void>;
  pending?: boolean;
  error?: string | null;
};

export function ListFormDialog({
  open,
  onClose,
  initial,
  onSubmit,
  pending = false,
  error,
}: ListFormDialogProps) {
  const t = useTranslations("lists.form");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-form-title"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 id="list-form-title" className="text-lg font-semibold text-foreground">
          {initial ? t("editTitle") : t("createTitle")}
        </h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="list-name">{t("name")}</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={120}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-description">{t("description")}</Label>
            <Input
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={1000}
              disabled={pending}
            />
          </div>
          <FieldError message={error ?? undefined} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending || name.trim().length === 0}>
              {initial ? t("save") : t("create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
