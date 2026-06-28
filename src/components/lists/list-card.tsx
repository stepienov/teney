"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { pageCardClass } from "@/components/layout/page-layout";
import { Link } from "@/i18n/routing";
import type { UserListSummary } from "@/lib/types/user-lists";
import { cn } from "@/lib/utils";

type ListCardProps = {
  list: UserListSummary;
  onEdit: (list: UserListSummary) => void;
  onDelete: (list: UserListSummary) => void;
};

export function ListCard({ list, onEdit, onDelete }: ListCardProps) {
  const t = useTranslations("lists");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className={cn("relative", pageCardClass, "transition-shadow hover:shadow-md")}>
      <Link
        href={`/lists/${list.id}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <h3 className="text-base font-semibold text-foreground pr-8">{list.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("itemCount", { count: list.itemCount })}
        </p>
      </Link>
      <div className="absolute top-3 right-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t("actions")}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-border bg-white py-1 shadow-md">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(list);
                }}
              >
                <Pencil className="size-3.5" aria-hidden />
                {t("edit")}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(list);
                }}
              >
                <Trash2 className="size-3.5" aria-hidden />
                {t("delete")}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
