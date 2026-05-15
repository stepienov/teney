import { queryOptions } from "@tanstack/react-query";

import { apiJson } from "@/lib/api-client";

/** Spring Boot Actuator /actuator/health (subset). */
export type ActuatorHealth = {
  status: string;
};

export const actuatorHealthQueryKey = ["api", "actuator", "health"] as const;

export function actuatorHealthQueryOptions() {
  return queryOptions({
    queryKey: actuatorHealthQueryKey,
    queryFn: () => apiJson<ActuatorHealth>("/actuator/health"),
  });
}
