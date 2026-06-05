"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  addRecentBeachSearch,
  useRecentBeachSearches,
} from "@/lib/beach-recent-searches";
import { cn } from "@/lib/utils";

type BeachNameSearchProps = {
  value: string;
  onSubmit: (name: string) => void;
  variant: "desktop" | "mobile";
};

function handleDraftChange(
  next: string,
  committed: string,
  setDraft: (next: string) => void,
  onSubmit: (name: string) => void,
) {
  setDraft(next);
  if (next.trim() === "" && committed.trim() !== "") {
    onSubmit("");
  }
}

export function BeachNameSearch({
  value,
  onSubmit,
  variant,
}: BeachNameSearchProps) {
  if (variant === "mobile") {
    return (
      <BeachNameSearchMobile value={value} onSubmit={onSubmit} />
    );
  }

  return <BeachNameSearchDesktop value={value} onSubmit={onSubmit} />;
}

function BeachNameSearchDesktop({
  value,
  onSubmit,
}: Omit<BeachNameSearchProps, "variant">) {
  const t = useTranslations("beaches");
  const [draft, setDraft] = useState(value);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    setDraft(trimmed);
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-80 shrink-0"
    >
      <label className="relative block">
        <span className="sr-only">{t("searchName")}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={draft}
          onChange={(event) =>
            handleDraftChange(event.target.value, value, setDraft, onSubmit)
          }
          placeholder={t("searchPlaceholder")}
          className="h-9 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    </form>
  );
}

function BeachNameSearchMobile({
  value,
  onSubmit,
}: Omit<BeachNameSearchProps, "variant">) {
  const t = useTranslations("beaches");
  const [draft, setDraft] = useState(value);
  const [recentOpen, setRecentOpen] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentSearches = useRecentBeachSearches();

  useEffect(() => {
    return () => {
      if (blurTimerRef.current != null) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  function commitSearch(name: string) {
    const trimmed = name.trim();
    setDraft(trimmed);
    onSubmit(trimmed);
    if (trimmed) {
      addRecentBeachSearch(trimmed);
    }
    setRecentOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitSearch(draft);
  }

  function handleFocus() {
    if (blurTimerRef.current != null) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    if (recentSearches.length > 0) {
      setRecentOpen(true);
    }
  }

  function handleBlur() {
    blurTimerRef.current = setTimeout(() => {
      setRecentOpen(false);
    }, 150);
  }

  function handleRecentMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  function handleRecentSelect(query: string) {
    setDraft(query);
    commitSearch(query);
  }

  const showRecent = recentOpen && recentSearches.length > 0;

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("searchName")}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            enterKeyHint="go"
            value={draft}
            onChange={(event) =>
            handleDraftChange(event.target.value, value, setDraft, onSubmit)
          }
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          className="h-10 shrink-0 px-4"
        >
          {t("searchSubmit")}
        </Button>
      </form>

      {showRecent ? (
        <div
          className="absolute inset-x-0 top-full z-40 mt-1 rounded-md border border-border bg-white shadow-md"
          onMouseDown={handleRecentMouseDown}
        >
          <p className="px-3 pt-2 text-xs font-medium text-muted-foreground">
            {t("recentSearches")}
          </p>
          <ul className="py-1">
            {recentSearches.map((query) => (
              <li key={query}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-foreground",
                    "hover:bg-muted/60 active:bg-muted",
                  )}
                  onClick={() => handleRecentSelect(query)}
                >
                  {query}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
