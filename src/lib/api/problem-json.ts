import type { ProblemJson } from "@/lib/types/user-auth";

export function parseProblemJson(text: string | undefined): ProblemJson | null {
  if (text == null || text.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(text) as ProblemJson;
  } catch {
    return null;
  }
}

export function problemDetail(
  problem: ProblemJson | null,
  fallback: string,
): string {
  if (problem?.detail) {
    return problem.detail;
  }
  if (problem?.fieldErrors?.length) {
    return problem.fieldErrors.map((e) => e.message).join(" ");
  }
  return fallback;
}
