"use client";

import { ListPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";

import { AddToListPicker } from "@/components/lists/add-to-list-picker";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AddToListButtonProps = {
  poiId: number;
  className?: string;
  size?: "sm" | "md";
};

export function AddToListButton({
  poiId,
  className,
  size = "md",
}: AddToListButtonProps) {
  const t = useTranslations("lists");
  const router = useRouter();
  const { status } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const buttonSize = size === "sm" ? "icon-sm" : "icon";

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (status !== "authenticated") {
      router.push("/auth");
      return;
    }
    setPickerOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        onClick={handleClick}
        disabled={status === "loading"}
        className={cn(
          "rounded-full border-white/80 bg-card/90 shadow-sm backdrop-blur-sm hover:bg-card",
          className,
        )}
        aria-label={t("addToList")}
      >
        <ListPlus className={iconSize} aria-hidden />
      </Button>
      {pickerOpen && (
        <AddToListPicker
          poiId={poiId}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
