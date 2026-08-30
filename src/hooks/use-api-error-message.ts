"use client";

import { useTranslations } from "next-intl";

import { ApiError } from "@/lib/api-client";
import { errorKeyFromProblem } from "@/lib/api/list-errors";
import { parseProblemJson } from "@/lib/api/problem-json";
import type { ListErrorMessageKey } from "@/lib/api/list-errors";

export function useApiErrorMessage(scope: "lists" | "friends" = "lists") {
  const t = useTranslations();

  return function resolveError(error: unknown, fallbackKey?: string): string {
    if (error instanceof ApiError) {
      const problem = parseProblemJson(error.bodyText);
      const key = errorKeyFromProblem(problem, error.status, scope);
      return t(key as ListErrorMessageKey);
    }
    if (fallbackKey) {
      return t(fallbackKey);
    }
    return t(
      scope === "friends"
        ? "friends.errors.generic"
        : "lists.errors.generic",
    );
  };
}
