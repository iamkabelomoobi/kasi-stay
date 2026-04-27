"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CreditCard,
  Flag,
  Heart,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Trees,
  User,
  Users,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavItem = {
  href: string;
  icon: ElementType;
  label: string;
  badge?: number;
  badgeVariant?: "default" | "warning";
};

type NavSection = {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      {
        href: "/dashboard/notifications",
        icon: Bell,
        label: "Notifications",
        badge: 4,
      },
    ],
  },
  {
    label: "Properties",
    items: [
      { href: "/dashboard/listings", icon: Home, label: "Browse listings" },
      { href: "/dashboard/saved", icon: Heart, label: "Saved properties" },
      {
        href: "/dashboard/saved-searches",
        icon: Search,
        label: "Saved searches",
      },
      { href: "/dashboard/reviews", icon: Star, label: "Reviews" },
    ],
  },
  {
    label: "Bookings",
    items: [
      {
        href: "/dashboard/inquiries",
        icon: MessageSquare,
        label: "Inquiries",
        badge: 2,
      },
      { href: "/dashboard/viewings", icon: CalendarCheck, label: "Viewings" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile", icon: User, label: "My profile" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      {
        href: "/dashboard/subscriptions",
        icon: CreditCard,
        label: "Subscriptions",
      },
    ],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      { href: "/dashboard/admin", icon: ShieldCheck, label: "Overview" },
      {
        href: "/dashboard/admin/listings",
        icon: Building2,
        label: "All listings",
        badge: 7,
        badgeVariant: "warning",
      },
      { href: "/dashboard/admin/users", icon: Users, label: "Users" },
      {
        href: "/dashboard/admin/reports",
        icon: Flag,
        label: "Reports",
        badge: 3,
        badgeVariant: "warning",
      },
      {
        href: "/dashboard/admin/agencies",
        icon: Layers,
        label: "Agencies & agents",
      },
      { href: "/dashboard/admin/amenities", icon: Trees, label: "Amenities" },
      {
        href: "/dashboard/admin/plans",
        icon: Sparkles,
        label: "Subscription plans",
      },
      {
        href: "/dashboard/admin/analytics",
        icon: BarChart3,
        label: "Analytics",
      },
    ],
  },
];

type AppSidebarProps = { isAdmin?: boolean };

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname();
  const visibleSections = navSections.filter((s) => !s.adminOnly || isAdmin);

  return (
    <aside className="flex h-screen w-[216px] min-w-[216px] flex-col border-r border-border bg-card">
      <div className="flex h-14 min-h-14 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="text-[15px] font-bold tracking-tight text-foreground"
        >
          kasi<span style={{ color: "var(--brand)" }}>stay</span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="py-2">
          {visibleSections.map((section, si) => (
            <div key={section.label}>
              {si > 0 && <Separator className="my-1.5 opacity-40" />}
              <p
                className="px-3.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest"
                style={{
                  color: section.adminOnly
                    ? "var(--brand)"
                    : "var(--muted-foreground)",
                }}
              >
                {section.label}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 px-3.5 py-[6px] text-[13px] transition-colors",
                      !isActive &&
                        "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive && "font-semibold",
                    )}
                    style={
                      isActive
                        ? {
                            background: "var(--brand-muted)",
                            color: "var(--brand-muted-foreground)",
                          }
                        : undefined
                    }
                  >
                    <Icon
                      className={cn(
                        "h-[15px] w-[15px] shrink-0",
                        !isActive &&
                          "text-muted-foreground/60 group-hover:text-foreground",
                      )}
                      style={isActive ? { color: "var(--brand)" } : undefined}
                      strokeWidth={1.7}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                        style={
                          item.badgeVariant === "warning"
                            ? {
                                background: "oklch(0.97 0.08 85)",
                                color: "oklch(0.45 0.12 85)",
                              }
                            : {
                                background: "var(--brand-muted)",
                                color: "var(--brand-muted-foreground)",
                              }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          <Separator className="my-1.5 opacity-40" />
          <Link
            href="/api/auth/sign-out"
            className="group flex items-center gap-2.5 px-3.5 py-[6px] text-[13px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut
              className="h-[15px] w-[15px] shrink-0 text-muted-foreground/60 group-hover:text-destructive"
              strokeWidth={1.7}
            />
            Sign out
          </Link>
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1">
          <button
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-card text-[12px] font-semibold text-foreground shadow-sm"
            type="button"
          >
            <SunMedium className="size-3.5" strokeWidth={1.8} /> Light
          </button>
          <button
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
            type="button"
          >
            <Moon className="size-3.5" strokeWidth={1.8} /> Dark
          </button>
        </div>
      </div>
    </aside>
  );
}
