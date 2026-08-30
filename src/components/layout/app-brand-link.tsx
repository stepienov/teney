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
        "flex min-w-0 items-center transition-opacity hover:opacity-90",
        className,
      )}
      title="teney.APP"
    >
      <TeneyLogo />
    </Link>
  );
}
