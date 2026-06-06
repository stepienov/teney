"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePathname, useRouter } from "@/i18n/routing";

type NavigationLoadingContextValue = {
  startNavigation: () => void;
};

const NavigationLoadingContext =
  createContext<NavigationLoadingContextValue | null>(null);

const NAVIGATION_LOADING_TIMEOUT_MS = 30_000;

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function shouldHandleLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (
    href == null ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) {
    return false;
  }

  const current = new URL(window.location.href);
  return !(
    url.pathname === current.pathname &&
    url.search === current.search &&
    url.hash === current.hash
  );
}

function NavigationLoadingOverlay({ visible }: { visible: boolean }) {
  const t = useTranslations("shell");

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/55 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("navigationLoading")}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border">
        <Loader2 className="size-7 animate-spin text-brand" aria-hidden />
      </div>
    </div>
  );
}

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);

    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      timeoutRef.current = null;
    }, NAVIGATION_LOADING_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    setIsNavigating(false);

    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [locale, pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const anchor = (event.target as Element).closest("a");
      if (anchor == null || !shouldHandleLink(anchor)) {
        return;
      }

      startNavigation();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startNavigation]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ startNavigation }), [startNavigation]);

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
      <NavigationLoadingOverlay visible={isNavigating} />
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): NavigationLoadingContextValue {
  const context = useContext(NavigationLoadingContext);
  if (context == null) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider",
    );
  }
  return context;
}

export function useNavigationRouter() {
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  return useMemo(
    () => ({
      ...router,
      push: (
        href: Parameters<typeof router.push>[0],
        options?: Parameters<typeof router.push>[1],
      ) => {
        startNavigation();
        return router.push(href, options);
      },
      replace: (
        href: Parameters<typeof router.replace>[0],
        options?: Parameters<typeof router.replace>[1],
      ) => {
        startNavigation();
        return router.replace(href, options);
      },
    }),
    [router, startNavigation],
  );
}
