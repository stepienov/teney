"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import {
  actuatorHealthQueryOptions,
  type ActuatorHealth,
} from "@/lib/query/actuator-health";

function formatHealth(data: ActuatorHealth | undefined) {
  if (!data) return "";
  return data.status;
}

export function ApiHealthStatus() {
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(
    actuatorHealthQueryOptions(),
  );

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
      aria-labelledby="api-health-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="api-health-heading"
            className="font-heading text-sm font-medium"
          >
            API health
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            GET <code className="rounded bg-muted px-1 py-0.5">/actuator/health</code>{" "}
            via TanStack Query
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="mt-4 min-h-[2.5rem] text-sm">
        {isPending ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : isError ? (
          <div className="space-y-2">
            <p className="font-medium text-destructive">Request failed</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof ApiError
                ? `${error.message} (${error.status})`
                : error instanceof Error
                  ? error.message
                  : "Unknown error"}
            </p>
          </div>
        ) : (
          <p>
            Status:{" "}
            <span className="font-mono font-medium">{formatHealth(data)}</span>
          </p>
        )}
      </div>
    </section>
  );
}
