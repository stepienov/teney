import type { ProblemJson } from "@/lib/types/user-auth";

export type ListErrorMessageKey =
  | "lists.errors.forbidden"
  | "lists.errors.notFound"
  | "lists.errors.limit"
  | "lists.errors.rateLimit"
  | "lists.errors.gone"
  | "lists.errors.validation"
  | "lists.errors.generic"
  | "friends.errors.forbidden"
  | "friends.errors.notFound"
  | "friends.errors.limit"
  | "friends.errors.rateLimit"
  | "friends.errors.conflict"
  | "friends.errors.validation"
  | "friends.errors.generic";

export function listErrorMessageKey(
  status: number,
  code?: string | null,
  scope: "lists" | "friends" = "lists",
): ListErrorMessageKey {
  const prefix = scope === "friends" ? "friends.errors" : "lists.errors";

  if (code === "TOO_MANY_REQUESTS" || status === 429) {
    return `${prefix}.rateLimit` as ListErrorMessageKey;
  }
  if (code === "CONFLICT" || status === 409) {
    return scope === "friends"
      ? (`${prefix}.conflict` as ListErrorMessageKey)
      : (`${prefix}.limit` as ListErrorMessageKey);
  }
  if (code === "GONE" || status === 410) {
    return `${prefix}.gone` as ListErrorMessageKey;
  }
  if (code === "FORBIDDEN" || status === 403) {
    return `${prefix}.forbidden` as ListErrorMessageKey;
  }
  if (code === "NOT_FOUND" || status === 404) {
    return `${prefix}.notFound` as ListErrorMessageKey;
  }
  if (code === "VALIDATION_ERROR" || status === 400) {
    return `${prefix}.validation` as ListErrorMessageKey;
  }
  return `${prefix}.generic` as ListErrorMessageKey;
}

export function errorKeyFromProblem(
  problem: ProblemJson | null,
  status: number,
  scope: "lists" | "friends" = "lists",
): ListErrorMessageKey {
  return listErrorMessageKey(status, problem?.code, scope);
}
