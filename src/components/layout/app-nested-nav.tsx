"use client";

import {
  ChevronDown,
  Heart,
  Home,
  ListChecks,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  defaultHomeTree,
  mergeHomeTree,
  toggleHomeTree,
  treeKeyForGroup,
  type HomeTreeState,
} from "@/components/layout/sidebar-nav-state";
import { useAuth } from "@/components/providers/auth-provider";
import { useInviteUnreadCount } from "@/hooks/use-invite-unread-count";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { NAV_GROUPS } from "@/lib/poi-categories/catalog";
import { cn } from "@/lib/utils";

const HOME_TREE_STORAGE_KEY = "teney-sidebar-home-tree-v2";
const HOME_TREE_CHANGE_EVENT = "teney-sidebar-home-tree-change";

function subscribeHomeTree(onStoreChange: () => void) {
  window.addEventListener(HOME_TREE_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(HOME_TREE_CHANGE_EVENT, onStoreChange);
}

function notifyHomeTreeChange() {
  window.dispatchEvent(new Event(HOME_TREE_CHANGE_EVENT));
}

function readHomeTreeJson(pathname: string): string {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultHomeTree(pathname));
  }
  try {
    const raw = sessionStorage.getItem(HOME_TREE_STORAGE_KEY);
    if (raw != null) {
      return raw;
    }
  } catch {
    // ignore
  }
  return JSON.stringify(defaultHomeTree(pathname));
}

type AppNestedNavProps = {
  onNavigate?: () => void;
};

function pathFromHref(href: string): string {
  return href.split("?")[0] ?? href;
}

function isPathActive(pathname: string, href: string): boolean {
  const path = pathFromHref(href);
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isExactPathActive(pathname: string, href: string): boolean {
  return pathname === pathFromHref(href);
}

function isSameNavTarget(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
): boolean {
  const [path, query = ""] = href.split("?");
  if (pathname !== path) {
    return false;
  }
  if (!query) {
    return searchParams.toString() === "";
  }
  const target = new URLSearchParams(query);
  for (const [key, value] of target.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }
  return true;
}

function writeStoredTree<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

function tileClass(active: boolean) {
  return cn(
    "nav-tree-tile flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
    !active && "text-foreground/75",
  );
}

type NavTileButtonProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  href?: string;
  onNavigate?: () => void;
};

function NavTileButton({
  label,
  icon: Icon,
  active,
  expanded,
  onToggle,
  href,
  onNavigate,
}: NavTileButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    onToggle();
    if (href != null && !isSameNavTarget(pathname, searchParams, href)) {
      router.push(href);
      onNavigate?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-expanded={expanded}
      data-active={active ? "true" : undefined}
      className={tileClass(active)}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 opacity-50 transition-transform",
          !expanded && "-rotate-90",
        )}
        aria-hidden
      />
    </button>
  );
}

type NavTileLinkProps = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: number;
  badgeAriaLabel?: string;
  onNavigate?: () => void;
};

function NavTileLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  badgeAriaLabel,
  onNavigate,
}: NavTileLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      data-active={active ? "true" : undefined}
      className={tileClass(active)}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge != null && badge > 0 ? (
        <span
          className="ml-auto shrink-0 rounded-full bg-soft-gradient px-1.5 py-0.5 text-xs font-medium text-ink tabular-nums"
          aria-label={badgeAriaLabel}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AppNestedNav({ onNavigate }: AppNestedNavProps) {
  const t = useTranslations("shell");
  const pathname = usePathname();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const storedHomeTreeJson = useSyncExternalStore(
    subscribeHomeTree,
    () => readHomeTreeJson(pathname),
    () => JSON.stringify(defaultHomeTree(pathname)),
  );

  const homeTree = useMemo(() => {
    const json = hasMounted
      ? storedHomeTreeJson
      : JSON.stringify(defaultHomeTree(pathname));
    try {
      return mergeHomeTree(JSON.parse(json) as Partial<HomeTreeState>);
    } catch {
      return defaultHomeTree(pathname);
    }
  }, [hasMounted, storedHomeTreeJson, pathname]);

  const toggleHome = useCallback(
    (key: keyof HomeTreeState) => {
      let parsed: Partial<HomeTreeState> | undefined;
      try {
        parsed = JSON.parse(readHomeTreeJson(pathname)) as Partial<HomeTreeState>;
      } catch {
        parsed = defaultHomeTree(pathname);
      }
      const next = toggleHomeTree(mergeHomeTree(parsed), key);
      writeStoredTree(HOME_TREE_STORAGE_KEY, next);
      notifyHomeTreeChange();
    },
    [pathname],
  );

  return (
    <div className="flex flex-col gap-1">
      <NavTileButton
        label={t("home")}
        icon={Home}
        active={pathname === "/"}
        expanded={homeTree.home}
        onToggle={() => toggleHome("home")}
        href="/"
        onNavigate={onNavigate}
      />
      {homeTree.home ? (
        <div className="space-y-1 pl-3">
          {NAV_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const treeKey = treeKeyForGroup(group.id);
            const groupActive = group.items.some((item) =>
              isPathActive(pathname, item.href),
            );

            return (
              <div key={group.id} className="space-y-1">
                <NavTileButton
                  label={t(group.labelKey)}
                  icon={GroupIcon}
                  active={groupActive}
                  expanded={homeTree[treeKey]}
                  onToggle={() => toggleHome(treeKey)}
                />
                {homeTree[treeKey] ? (
                  <div className="space-y-1 pl-3">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <NavTileLink
                          key={item.href}
                          href={item.href}
                          label={t(item.navKey)}
                          icon={ItemIcon}
                          active={isPathActive(pathname, item.href)}
                          onNavigate={onNavigate}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AppAccountNav({ onNavigate }: AppNestedNavProps) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const { status, user } = useAuth();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isAuthenticated =
    hasMounted && status === "authenticated" && user != null;

  const accountLabel = isAuthenticated ? user.email : t("account");
  const accountHref = isAuthenticated ? "/account" : "/login";
  const accountActive = isAuthenticated
    ? isExactPathActive(pathname, "/account")
    : isPathActive(pathname, "/login");

  const { data: unreadInvites } = useInviteUnreadCount();

  return (
    <div className="flex flex-col gap-1">
      <NavTileLink
        href={accountHref}
        label={accountLabel}
        icon={User}
        active={accountActive}
        onNavigate={onNavigate}
      />
      {isAuthenticated ? (
        <div className="space-y-1 pl-3">
          <NavTileLink
            href="/favorites"
            label={t("favorites")}
            icon={Heart}
            active={isPathActive(pathname, "/favorites")}
            onNavigate={onNavigate}
          />
          <NavTileLink
            href="/lists"
            label={t("lists")}
            icon={ListChecks}
            active={isPathActive(pathname, "/lists")}
            badge={unreadInvites?.lists}
            badgeAriaLabel={t("unreadInvites", {
              count: unreadInvites?.lists ?? 0,
            })}
            onNavigate={onNavigate}
          />
          <NavTileLink
            href="/friends"
            label={t("friends")}
            icon={Users}
            active={isPathActive(pathname, "/friends")}
            badge={unreadInvites?.friends}
            badgeAriaLabel={t("unreadInvites", {
              count: unreadInvites?.friends ?? 0,
            })}
            onNavigate={onNavigate}
          />
          <NavTileLink
            href="/groups"
            label={t("groups")}
            icon={UsersRound}
            active={isPathActive(pathname, "/groups")}
            badge={unreadInvites?.groups}
            badgeAriaLabel={t("unreadInvites", {
              count: unreadInvites?.groups ?? 0,
            })}
            onNavigate={onNavigate}
          />
        </div>
      ) : (
        <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
          {t("accountGuestHint")}
        </p>
      )}
    </div>
  );
}
