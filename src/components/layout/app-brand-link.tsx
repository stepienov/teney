import { TeneyLogo } from "@/components/brand/teney-logo";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type AppBrandLinkProps = {
  className?: string;
};

export function AppBrandLink({ className }: AppBrandLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex min-w-0 items-center gap-2.5 text-brand-foreground transition-opacity hover:opacity-90",
        className,
      )}
      title="Teney"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/15">
        <TeneyLogo className="w-4 stroke-brand-foreground" />
      </span>
      <span className="truncate text-sm font-semibold">Teney</span>
    </Link>
  );
}
