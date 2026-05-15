"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { TeneyLogo } from "@/components/brand/teney-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Start" },
  { href: "#status", label: "Status" },
] as const;

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
        >
          <TeneyLogo className="w-8 stroke-white" />
          <span className="font-heading text-sm font-bold uppercase tracking-[0.12em]">
            Teney
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide md:flex"
          aria-label="Main"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-white/50 bg-white/10 text-white hover:bg-white/20"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="border-border bg-ocean-mist">
              <SheetHeader>
                <SheetTitle className="font-heading uppercase tracking-wide text-ocean-deep">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2" aria-label="Mobile main">
                {navItems.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className="rounded-2xl px-3 py-2.5 text-sm font-medium text-ocean-deep hover:bg-ocean-cyan/40"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
