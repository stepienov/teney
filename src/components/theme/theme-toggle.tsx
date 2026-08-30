"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const t = useTranslations("shell");
  const { theme, toggleTheme } = useTheme();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const resolved = hasMounted ? theme : "light";
  const label = resolved === "dark" ? t("themeToLight") : t("themeToDark");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 text-foreground hover:bg-muted hover:text-foreground"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {resolved === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
