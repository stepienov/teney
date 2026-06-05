"use client";

import { useCallback, useRef, useState } from "react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type BeachCardDesktopNameProps = {
  href: string;
  name: string;
  linkClassName?: string;
};

function isOverflowing(element: HTMLElement): boolean {
  return (
    element.scrollHeight > element.clientHeight + 1 ||
    element.scrollWidth > element.clientWidth + 1
  );
}

export function BeachCardDesktopName({
  href,
  name,
  linkClassName,
}: BeachCardDesktopNameProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const syncOverflow = useCallback(() => {
    const element = textRef.current;
    if (!element) {
      setShowTooltip(false);
      return;
    }

    setShowTooltip(isOverflowing(element));
  }, []);

  return (
    <div
      className="beach-card-name group/name relative min-h-0 min-w-0 flex-1"
      onMouseEnter={syncOverflow}
      onFocus={syncOverflow}
    >
      <Link href={href} className={linkClassName}>
        <h3
          ref={textRef}
          className="line-clamp-3 text-sm font-semibold break-words text-foreground transition-colors duration-200 group-hover/name:text-brand group-focus-within/name:text-brand"
        >
          {name}
        </h3>
      </Link>

      {showTooltip ? (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-0 z-50 mb-1 max-w-[min(100%,16rem)] rounded px-2 py-1 text-xs font-medium leading-snug text-white opacity-0 transition-opacity duration-100",
            "group-hover/name:opacity-100 group-focus-within/name:opacity-100",
          )}
          style={{ backgroundColor: "var(--foreground)" }}
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}
