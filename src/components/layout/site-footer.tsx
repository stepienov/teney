import { TeneyLogo } from "@/components/brand/teney-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <TeneyLogo className="w-10 stroke-ocean-deep text-ocean-deep" />
        <p className="text-[0.65rem] font-semibold uppercase tracking-caps-wide text-ocean-teal">
          Tylko dobry klimat
        </p>
        <p className="font-heading text-sm font-bold uppercase tracking-[0.1em] text-ocean-deep">
          Teney
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} teney.app
        </p>
      </div>
    </footer>
  );
}
