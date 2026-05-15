import { ApiHealthStatus } from "@/components/api-health-status";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="max-w-xl space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Next.js frontend wired to the Spring API with TanStack Query and shadcn/ui.
        </p>
      </div>
      <div className="max-w-md">
        <ApiHealthStatus />
      </div>
    </div>
  );
}
