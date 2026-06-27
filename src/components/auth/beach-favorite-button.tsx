"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeachFavoriteButtonProps = {
  poiId: number;
  className?: string;
  size?: "sm" | "md";
};

export function BeachFavoriteButton({
  poiId,
  className,
  size = "md",
}: BeachFavoriteButtonProps) {
  const t = useTranslations("favorites");
  const router = useRouter();
  const { status, isFavorite, toggleFavorite } = useAuth();
  const [pending, setPending] = useState(false);

  const favorite = isFavorite(poiId);
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const buttonSize = size === "sm" ? "icon-sm" : "icon";

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setPending(true);
    try {
      await toggleFavorite(poiId);
    } catch {
      // rollback handled in provider
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={buttonSize}
      onClick={handleClick}
      disabled={pending || status === "loading"}
      className={cn(
        "rounded-full border-white/80 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white",
        favorite && "border-brand/30 bg-brand-muted text-brand hover:bg-brand-muted",
        className,
      )}
      aria-label={favorite ? t("remove") : t("add")}
      aria-pressed={favorite}
    >
      <Heart
        className={cn(iconSize, favorite && "fill-current")}
        aria-hidden
      />
    </Button>
  );
}
