import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

type SelectFieldProps = React.ComponentProps<"select">;

export function SelectField({ className, ...props }: SelectFieldProps) {
  return <select className={cn(selectClassName, className)} {...props} />;
}
