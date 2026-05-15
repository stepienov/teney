"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import {
  actuatorHealthQueryOptions,
  type ActuatorHealth,
} from "@/lib/query/actuator-health";
import { cn } from "@/lib/utils";

function formatHealth(data: ActuatorHealth | undefined) {
  if (!data) return "";
  return data.status;
}

function statusTone(status: string | undefined) {
  if (status === "UP") {
    return {
      dot: "bg-ocean-teal",
      badge: "border-ocean-teal/30 bg-ocean-cyan/50 text-ocean-deep",
    };
  }
  if (status === "DOWN") {
    return {
      dot: "bg-rose-400",
      badge: "border-rose-200 bg-rose-50 text-rose-800",
    };
  }
  return {
    dot: "bg-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  };
}

export function ApiHealthStatus() {
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(
    actuatorHealthQueryOptions(),
  );

  const status = formatHealth(data);
  const tone = statusTone(isError ? "DOWN" : status);

  return (
    <section
      className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_-20px_rgba(26,46,53,0.12)]"
      aria-labelledby="api-health-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ocean-teal/35 text-ocean-deep">
            <Waves className="size-5 stroke-[1.5]" aria-hidden />
          </div>
          <div>
            <h2
              id="api-health-heading"
              className="font-heading text-sm font-bold uppercase tracking-wide text-ocean-deep"
            >
              Połączenie
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Czy serwer jest dostępny
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-ocean-teal/40 bg-ocean-mist text-ocean-deep"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("size-3.5", isFetching && "animate-spin")}
            aria-hidden
          />
          {isFetching ? "Chwila…" : "Odśwież"}
        </Button>
      </div>

      <div className="mt-5 min-h-[2.75rem]">
        {isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-ocean-teal" />
            Sprawdzam połączenie…
          </p>
        ) : isError ? (
          <div className="space-y-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                tone.badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full", tone.dot)} />
              Offline
            </span>
            <p className="text-sm text-muted-foreground">
              {error instanceof ApiError
                ? `${error.message} (${error.status})`
                : error instanceof Error
                  ? error.message
                  : "Coś poszło nie tak"}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                tone.badge,
              )}
            >
              <span className={cn("size-2 rounded-full", tone.dot)} />
              {status || "—"}
            </span>
            <p className="text-sm text-muted-foreground">
              Wszystko w porządku — możesz korzystać z aplikacji.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
