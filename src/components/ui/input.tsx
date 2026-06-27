import { cn } from "@/lib/utils";

const inputClassName =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

type InputProps = React.ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

type LabelProps = React.ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }
  return <p className="text-xs text-destructive">{message}</p>;
}
