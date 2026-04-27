"use client";

import Link from "next/link";
import { Bell, CalendarDays, CircleHelp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AppUserRole = "RENTER" | "ADMIN" | "AGENT" | "OWNER" | "BUYER";

type AppTopbarProps = {
  user: { email: string; name: string; role: AppUserRole };
};

const roleLabel: Record<AppUserRole, string> = {
  RENTER: "Renter",
  ADMIN: "Admin",
  AGENT: "Agent",
  OWNER: "Owner",
  BUYER: "Buyer",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppTopbar({ user }: AppTopbarProps) {
  return (
    <header className="flex h-14 min-h-14 items-center gap-4 border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-full max-w-3xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          aria-label="Search"
          className="h-9 rounded-lg bg-muted pl-9 pr-16 text-sm shadow-none placeholder:text-muted-foreground/50"
          placeholder="Search for actions, requests, report, and people..."
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 flex h-6 -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-2 text-xs font-semibold text-muted-foreground shadow-sm">
          ⌘ K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            background: "var(--brand-muted)",
            color: "var(--brand-muted-foreground)",
          }}
        >
          {roleLabel[user.role]}
        </span>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link aria-label="Notifications" href="/dashboard/notifications">
            <Bell strokeWidth={1.8} className="size-4" />
            <span
              className="absolute right-1.5 top-1 grid size-4 place-items-center rounded-full text-[9px] font-bold text-white"
              style={{ background: "var(--brand)" }}
            >
              1
            </span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Help"
        >
          <CircleHelp strokeWidth={1.8} className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Calendar"
        >
          <CalendarDays strokeWidth={1.8} className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={`${user.name} profile`}
              className="ml-1 grid size-9 place-items-center rounded-full border text-xs font-bold transition hover:opacity-90"
              style={{
                background: "var(--brand-muted)",
                borderColor: "var(--brand-muted)",
                color: "var(--brand-muted-foreground)",
              }}
              type="button"
            >
              {getInitials(user.name || user.email) || "KS"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-[12px] font-normal text-muted-foreground">
              Signed in as
              <p className="font-semibold text-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="text-[13px]">
                My profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="text-[13px]">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/subscriptions" className="text-[13px]">
                Subscriptions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/api/auth/sign-out"
                className="text-[13px] text-destructive focus:text-destructive"
              >
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
