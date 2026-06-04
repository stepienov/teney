"use client";

import { ChevronDown, ChevronRight, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

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
        className={cn(
          triggerClass,
          hasActive &&
            "border-brand/50 bg-brand-muted/60 text-brand shadow-sm hover:bg-brand-muted/70",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        role="button"
        tabIndex={0}
      >
        <span className="truncate font-medium">{label}</span>
        <span className="ml-1 inline-flex shrink-0 items-center gap-0.5">
          {hasActive && onClear ? (
            <button
              type="button"
              className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-brand/80 transition-colors hover:bg-white/80 hover:text-brand"
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
          ) : null}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              hasActive && "text-brand/70",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </span>
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

function FilterToggleSwitch({
  checked,
  onChange,
  label,
  size = "md",
  readOnly = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const compact = size === "sm";
  const [displayChecked, setDisplayChecked] = useState(checked);

  useEffect(() => {
    if (!readOnly) {
      setDisplayChecked(checked);
    }
  }, [checked, readOnly]);

  const shown = readOnly ? checked : displayChecked;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown}
      aria-label={label}
      tabIndex={readOnly ? -1 : undefined}
      onClick={
        readOnly
          ? undefined
          : (event) => {
              event.stopPropagation();
              const next = !displayChecked;
              setDisplayChecked(next);
              onChange(next);
            }
      }
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150",
        readOnly ? "pointer-events-none" : "cursor-pointer",
        compact ? "h-[1.125rem] w-8" : "h-6 w-11",
        shown ? "bg-brand" : "bg-neutral-300",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white transition-transform duration-150",
          compact ? "size-3.5 shadow-sm" : "size-5 shadow-sm",
          shown
            ? compact
              ? "translate-x-[1.125rem]"
              : "translate-x-[1.375rem]"
            : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function MobileFilterSwitchRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const [localChecked, setLocalChecked] = useState(checked);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  function toggle() {
    const next = !localChecked;
    setLocalChecked(next);
    onChange(next);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex cursor-pointer items-center justify-between gap-3 border-b border-border px-4 py-3.5 active:bg-muted/40"
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
    >
      <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
      <FilterToggleSwitch
        checked={localChecked}
        onChange={(next) => {
          setLocalChecked(next);
          onChange(next);
        }}
        label={label}
        size="md"
        readOnly
      />
    </div>
  );
}

export function FilterSwitchRow({
  checked,
  label,
  onChange,
  variant = "desktop",
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  variant?: "desktop" | "mobile";
}) {
  if (variant === "mobile") {
    return (
      <MobileFilterSwitchRow
        checked={checked}
        label={label}
        onChange={onChange}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80">
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{label}</span>
      <FilterToggleSwitch
        checked={checked}
        onChange={onChange}
        label={label}
        size="sm"
      />
    </div>
  );
}

/** @deprecated Użyj FilterSwitchRow */
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
    <FilterSwitchRow checked={checked} label={label} onChange={onChange} variant="desktop" />
  );
}

type FilterSubmenuProps = {
  label: string;
  hasActive?: boolean;
  accentLabel?: boolean;
  children: ReactNode;
};

export function FilterMobileExpandable({
  label,
  hasActive = false,
  accentLabel = false,
  children,
}: FilterSubmenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-t border-border px-4 py-3.5 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={cn(
            "text-sm font-medium",
            accentLabel || hasActive ? "text-brand" : "text-foreground",
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="pb-1 [&>:last-child]:border-b-0">{children}</div>
      ) : null}
    </div>
  );
}

/** Wiersz w menu Filtr — podlista po najechaniu (nawierzchnia, region). */
export function FilterSubmenu({
  label,
  hasActive = false,
  accentLabel = false,
  children,
}: FilterSubmenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/80",
          hasActive && "bg-brand-muted/30 font-medium",
          open && "bg-muted/80",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            accentLabel || hasActive ? "font-medium text-brand" : "text-foreground",
          )}
        >
          {label}
        </span>
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
  variant = "desktop",
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
  variant?: "desktop" | "mobile";
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
        "flex w-full cursor-pointer items-center gap-2 text-left text-sm transition-colors",
        variant === "mobile"
          ? "px-4 py-3.5 hover:bg-muted/80"
          : "rounded-md px-2 py-1.5 hover:bg-muted/80",
        selected &&
          (variant === "mobile"
            ? "bg-muted/60 font-semibold text-foreground"
            : "bg-brand-muted/40 font-medium text-brand"),
      )}
    >
      {label}
    </button>
  );
}

type SortMenuProps = {
  sortLabel: string;
  children: ReactNode;
};

export function SortMenu({ sortLabel, children }: SortMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(triggerClass, "pr-3")}
        aria-expanded={open}
        aria-haspopup="menu"
        role="button"
        tabIndex={0}
      >
        <span className="truncate font-medium">{sortLabel}</span>
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
