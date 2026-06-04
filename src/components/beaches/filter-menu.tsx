"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

const triggerClass =
  "inline-flex h-9 min-w-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-muted/50";

type FilterMenuProps = {
  label: string;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
  hasActive?: boolean;
  clearLabel?: string;
  onClear?: () => void;
};

export function FilterMenu({
  label,
  children,
  className,
  align = "left",
  hasActive = false,
  clearLabel,
  onClear,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("relative shrink-0", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(triggerClass, hasActive && "border-brand/40 bg-brand-muted/30")}
        aria-expanded={open}
        aria-haspopup="menu"
        role="button"
        tabIndex={0}
      >
        <span className="truncate font-medium">{label}</span>
        {hasActive && onClear && (
          <button
            type="button"
            className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
            aria-label={clearLabel}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "absolute top-full z-50 pt-1.5",
          align === "right" ? "right-0" : "left-0",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "min-w-[12rem] overflow-visible rounded-lg border border-border bg-white shadow-md transition-opacity duration-150",
            open ? "opacity-100" : "opacity-0",
          )}
          role="menu"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function FilterCheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 cursor-pointer rounded border-border accent-primary"
      />
      <span className="min-w-0 flex-1 cursor-pointer truncate">{label}</span>
    </label>
  );
}

type FilterSubmenuProps = {
  label: string;
  hasActive?: boolean;
  children: ReactNode;
};

/** Wiersz w menu Filtr — podlista po najechaniu (nawierzchnia, region). */
export function FilterSubmenu({ label, hasActive = false, children }: FilterSubmenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/80",
          hasActive && "bg-brand-muted/30 font-medium text-brand",
          open && "bg-muted/80",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      <div
        className={cn(
          "absolute top-0 left-full z-[60] pl-1",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "max-h-[min(20rem,60vh)] min-w-[11rem] overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-md transition-opacity duration-150",
            open ? "opacity-100" : "opacity-0",
          )}
          role="menu"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Kafelek-filtr (jak badge w liście plaż) z rolą checkbox. */
export function FilterBadgeToggle({
  checked,
  label,
  onToggle,
  variant = "default",
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  variant?: "default" | "paid";
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center justify-center rounded-md px-2 text-xs font-medium leading-none whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        variant === "paid"
          ? checked
            ? "bg-brand text-brand-foreground ring-1 ring-brand"
            : "bg-brand-muted text-brand hover:bg-brand-muted/80"
          : checked
            ? "bg-brand-muted text-brand ring-1 ring-brand/50"
            : "bg-muted text-secondary-foreground hover:bg-neutral-200",
      )}
    >
      {label}
    </button>
  );
}

export function FilterOptionRow({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/80",
        selected && "bg-brand-muted/40 font-medium text-brand",
      )}
    >
      {label}
    </button>
  );
}

type SortMenuProps = {
  sortLabel: string;
  activeLabel: string;
  isActive: boolean;
  showDirection: boolean;
  sortDirection: "ASC" | "DESC";
  directionTitle: string;
  onDirectionToggle: () => void;
  children: ReactNode;
};

export function SortMenu({
  sortLabel,
  activeLabel,
  isActive,
  showDirection,
  sortDirection,
  directionTitle,
  onDirectionToggle,
  children,
}: SortMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(
          triggerClass,
          isActive && "border-brand/40 bg-brand-muted/30",
          !isActive && "pr-3",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        role="button"
        tabIndex={0}
      >
        <span className="truncate font-medium">{isActive ? activeLabel : sortLabel}</span>
        {showDirection && (
          <button
            type="button"
            className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
            title={directionTitle}
            aria-label={directionTitle}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDirectionToggle();
            }}
          >
            {sortDirection === "ASC" ? (
              <ArrowDown className="size-3.5" aria-hidden />
            ) : (
              <ArrowUp className="size-3.5" aria-hidden />
            )}
          </button>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "absolute top-full z-50 pt-1.5",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "min-w-[11rem] overflow-visible rounded-lg border border-border bg-white py-1 shadow-md transition-opacity duration-150",
            open ? "opacity-100" : "opacity-0",
          )}
          role="menu"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { triggerClass };
