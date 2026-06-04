import { Loader2 } from "lucide-react";

type BeachLoadingIndicatorProps = {
  className?: string;
};

export function BeachLoadingIndicator({
  className = "min-h-[12rem]",
}: BeachLoadingIndicatorProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
