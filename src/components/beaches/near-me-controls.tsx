"use client";

import { MapPin, Navigation, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NearMeControlsProps = {
  active: boolean;
  geoStatus: "idle" | "loading" | "unsupported" | "denied" | "error" | "ready";
  onEnable: () => void;
  onDisable: () => void;
};

export function NearMeControls({
  active,
  geoStatus,
  onEnable,
  onDisable,
}: NearMeControlsProps) {
  const t = useTranslations("beaches");

  if (!active) {
    return (
      <div className="rounded-3xl border border-ocean-teal/30 bg-ocean-cyan/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-ocean-deep">
              {t("nearMeTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("nearMeHint")}
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 gap-2 rounded-full px-5"
            onClick={onEnable}
          >
            <Navigation className="size-4" aria-hidden />
            {t("nearMeEnable")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 sm:p-5",
        geoStatus === "ready"
          ? "border-ocean-teal/40 bg-ocean-cyan/25"
          : "border-amber-200/80 bg-amber-50/90",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ocean-teal shadow-sm">
            <MapPin className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-ocean-deep">
              {t("nearMeActiveTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {geoStatus === "loading" && t("nearMeLocating")}
              {geoStatus === "ready" && t("nearMeSorted")}
              {geoStatus === "denied" && t("nearMeDenied")}
              {geoStatus === "unsupported" && t("nearMeUnsupported")}
              {geoStatus === "error" && t("nearMeError")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full shrink-0 gap-1.5 rounded-full border-ocean-teal/30 bg-white sm:w-auto"
          onClick={onDisable}
        >
          <X className="size-3.5" aria-hidden />
          {t("nearMeDisable")}
        </Button>
      </div>
    </div>
  );
}
