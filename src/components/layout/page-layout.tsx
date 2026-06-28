import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared page padding — matches account dashboard and beaches explorer. */
export const pagePaddingClass = "px-4 py-8 sm:px-8 sm:py-10";

/** White card surface used in sections and list tiles. */
export const pageCardClass =
  "rounded-lg border border-border bg-white p-5 shadow-sm";

export const pageCardInteractiveClass =
  "rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md";

export const pageRowClass =
  "rounded-lg border border-border bg-white px-4 py-3 shadow-sm";

/** Standard max width for account/settings page body. */
export const pageContentClass = "max-w-3xl";

/** Wider content for card grids (lists, favorites). */
export const pageWideContentClass = "max-w-5xl";

/** Compact forms — profile, invite, rename. */
export const pageFormClass = "max-w-sm space-y-4";

/** Vertical rhythm between major blocks inside PageContent. */
export const pageStackClass = "flex flex-col gap-6";

/** Two-column hub / list card grid. */
export const pageCardGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

type PageContentProps = {
  children: ReactNode;
  width?: "default" | "wide";
  className?: string;
};

export function PageContent({
  children,
  width = "default",
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        width === "wide" ? pageWideContentClass : pageContentClass,
        pageStackClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageFormFieldProps = {
  children: ReactNode;
};

export function PageFormField({ children }: PageFormFieldProps) {
  return <div className="space-y-1.5">{children}</div>;
}

type PageFormStackProps = {
  children: ReactNode;
  className?: string;
};

export function PageFormStack({ children, className }: PageFormStackProps) {
  return <div className={cn(pageFormClass, className)}>{children}</div>;
}

type PageRootProps = {
  children: ReactNode;
  className?: string;
};

export function PageRoot({ children, className }: PageRootProps) {
  return <div className={cn(pagePaddingClass, className)}>{children}</div>;
}

type PageLoadingProps = {
  children: ReactNode;
};

export function PageLoading({ children }: PageLoadingProps) {
  return (
    <div className={cn(pagePaddingClass, "text-sm text-muted-foreground")}>
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0 self-start">{actions}</div> : null}
    </header>
  );
}

type PageSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title ? (
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className={cn(title || description ? "mt-5" : undefined, contentClassName)}>
        {children}
      </div>
    </section>
  );
}

type PageEmptyProps = {
  children: ReactNode;
  className?: string;
};

export function PageEmpty({ children, className }: PageEmptyProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border px-4 py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

type GuestPromptProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  actions: ReactNode;
};

export function GuestPrompt({ icon: Icon, title, body, actions }: GuestPromptProps) {
  return (
    <PageRoot>
      <div className="max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
        <Icon className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">{actions}</div>
      </div>
    </PageRoot>
  );
}

type PageTab = {
  key: string;
  label: string;
  badge?: number;
};

type PageTabBarProps = {
  tabs: PageTab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
};

export function PageTabBar({
  tabs,
  activeKey,
  onChange,
  className,
}: PageTabBarProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap gap-2 border-b border-border", className)}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "flex items-center gap-1.5 border-b-2 -mb-px px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 ? (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-xs text-white">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
