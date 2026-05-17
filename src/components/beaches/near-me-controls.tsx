"use client";

import { MapPin, Navigation, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NearMeControlsProps = {
  active: boolean;
  geoStatus: "idle" | "loading" | "unsupported" | "denied" | "error" | "ready";
  radiusKm: number;
  accuracyMeters?: number;
  onEnable: () => void;
  onDisable: () => void;
  onRadiusChange: (radiusKm: number) => void;
};

function formatAccuracy(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export function NearMeControls({
  active,
  geoStatus,
  radiusKm,
  accuracyMeters,
  onEnable,
  onDisable,
  onRadiusChange,
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
              {t("nearMeHint", { radius: radiusKm })}
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
      <div className="flex flex-col gap-4">
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
              {geoStatus === "ready" &&
                t("nearMeSorted", {
                  accuracy: accuracyMeters
                    ? formatAccuracy(accuracyMeters)
                    : t("unknown"),
                })}
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
        <label className="grid gap-2 rounded-2xl bg-white/75 p-3 text-sm text-ocean-deep shadow-sm ring-1 ring-ocean-cyan/30">
          <span className="flex items-center justify-between gap-3 font-semibold">
            {t("nearMeRadius")}
            <span className="text-ocean-teal">
              {t("nearMeRadiusValue", { radius: radiusKm })}
            </span>
          </span>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full accent-ocean-teal"
          />
        </label>
      </div>
    </div>
  );
}
