"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils";

type RatingControlProps = {
  value: number | null;
  onChange: (rating: 1 | 2 | 3) => Promise<void>;
  onClear: () => Promise<void>;
  disabled?: boolean;
  className?: string;
};

export function RatingControl({
  value,
  onChange,
  onClear,
  disabled = false,
  className,
}: RatingControlProps) {
  const t = useTranslations("lists.rating");
  const [pending, setPending] = useState(false);

  async function handleClick(rating: 1 | 2 | 3) {
    if (disabled || pending) {
      return;
    }
    setPending(true);
    try {
      if (value === rating) {
        await onClear();
      } else {
        await onChange(rating);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label={t("label")}
    >
      {([1, 2, 3] as const).map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled || pending}
          onClick={() => void handleClick(rating)}
          className={cn(
            "rounded p-0.5 transition-colors disabled:opacity-50",
            value != null && value >= rating
              ? "text-brand"
              : "text-muted-foreground hover:text-brand",
          )}
          aria-label={t("rate", { value: rating })}
          aria-pressed={value === rating}
        >
          <Star
            className={cn("size-4", value != null && value >= rating && "fill-current")}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
