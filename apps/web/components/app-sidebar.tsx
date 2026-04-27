"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Heart,
  Search,
  Star,
  MessageSquare,
  CalendarCheck,
  Bell,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  Building2,
  Users,
  Flag,
  Layers,
  Trees,
  Sparkles,
  BarChart3,
  PlusSquare,
  ClipboardList,
  TrendingUp,
  Zap,
  Users2,
  ShoppingBag,
  Wrench,
  MessageCircle,
  Scale,
  Newspaper,
  Briefcase,
  Mail,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { cn } from "@/lib/utils";
import { UserProfileFragment } from "@kasistay/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "default" | "warning";
};

type NavSection = {
  label: string;
  items: NavItem[];
  roles?: UserProfileFragment["role"][];
  isAdmin?: boolean;
};

// ─── Sections ─────────────────────────────────────────────────────────────────

const ALL_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Messages", href: "/dashboard/messages", icon: MessageCircle },
    ],
  },
  {
    label: "Properties",
    roles: ["RENTER", "BUYER"],
    items: [
      { label: "Browse listings", href: "/dashboard/listings", icon: Home },
      { label: "Saved properties", href: "/dashboard/saved", icon: Heart },
      {
        label: "Saved searches",
        href: "/dashboard/saved-searches",
        icon: Search,
      },
      { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    ],
  },
  {
    label: "Bookings",
    roles: ["RENTER", "BUYER"],
    items: [
      { label: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
      { label: "Viewings", href: "/dashboard/viewings", icon: CalendarCheck },
    ],
  },
  {
    label: "Listings",
    roles: ["AGENT"],
    items: [
      { label: "My listings", href: "/dashboard/my-listings", icon: Home },
      {
        label: "Add listing",
        href: "/dashboard/my-listings/new",
        icon: PlusSquare,
      },
      { label: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
      { label: "Viewings", href: "/dashboard/viewings", icon: CalendarCheck },
    ],
  },
  {
    label: "Business",
    roles: ["AGENT"],
    items: [
      { label: "My agency", href: "/dashboard/agency", icon: Building2 },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Boosts", href: "/dashboard/boosts", icon: Zap },
      {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "My Properties",
    roles: ["OWNER"],
    items: [
      { label: "My listings", href: "/dashboard/my-listings", icon: Home },
      {
        label: "Add listing",
        href: "/dashboard/my-listings/new",
        icon: PlusSquare,
      },
      { label: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
      { label: "Viewings", href: "/dashboard/viewings", icon: CalendarCheck },
      { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
      { label: "Boosts", href: "/dashboard/boosts", icon: Zap },
      {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Roommates", href: "/dashboard/roommates", icon: Users2 },
      {
        label: "Marketplace",
        href: "/dashboard/marketplace",
        icon: ShoppingBag,
      },
      { label: "Services", href: "/dashboard/services", icon: Wrench },
      { label: "Attorneys", href: "/dashboard/attorneys", icon: Scale },
      { label: "Articles", href: "/dashboard/articles", icon: Newspaper },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "My profile", href: "/dashboard/profile", icon: User },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Help & support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
  {
    label: "Admin",
    roles: ["ADMIN"],
    isAdmin: true,
    items: [
      { label: "Overview", href: "/dashboard/admin", icon: ShieldCheck },
      {
        label: "All listings",
        href: "/dashboard/admin/listings",
        icon: Building2,
        badgeVariant: "warning",
      },
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      {
        label: "Reports",
        href: "/dashboard/admin/reports",
        icon: Flag,
        badgeVariant: "warning",
      },
      {
        label: "Agencies & agents",
        href: "/dashboard/admin/agencies",
        icon: Layers,
      },
      { label: "Amenities", href: "/dashboard/admin/amenities", icon: Trees },
      {
        label: "Subscription plans",
        href: "/dashboard/admin/plans",
        icon: Sparkles,
      },
      {
        label: "Analytics",
        href: "/dashboard/admin/analytics",
        icon: BarChart3,
      },
      { label: "Roommates", href: "/dashboard/admin/roommates", icon: Users2 },
      {
        label: "Marketplace",
        href: "/dashboard/admin/marketplace",
        icon: ShoppingBag,
      },
      { label: "Services", href: "/dashboard/admin/services", icon: Wrench },
      { label: "Attorneys", href: "/dashboard/admin/attorneys", icon: Scale },
      { label: "Articles", href: "/dashboard/admin/articles", icon: Newspaper },
      { label: "Careers", href: "/dashboard/admin/careers", icon: Briefcase },
      {
        label: "Applications",
        href: "/dashboard/admin/applications",
        icon: ClipboardList,
      },
      {
        label: "Contact messages",
        href: "/dashboard/admin/contact",
        icon: Mail,
      },
      {
        label: "Agent applications",
        href: "/dashboard/admin/agent-applications",
        icon: Users,
      },
      {
        label: "Advertising requests",
        href: "/dashboard/admin/advertising",
        icon: Zap,
      },
    ],
  },
];

// ─── Single nav item ──────────────────────────────────────────────────────────

function NavItemRow({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link href={item.href}>
          <Icon className="size-4 shrink-0" strokeWidth={1.7} />
          <span className="flex-1 truncate text-[13px]">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={cn(
                "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                item.badgeVariant === "warning"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  : "bg-primary/10 text-primary",
              )}
            >
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: UserProfileFragment["role"];
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const visibleSections = ALL_SECTIONS.filter(
    (s) =>
      !s.roles || s.roles.includes(user.role as UserProfileFragment["role"]),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white"
                  style={{ background: "var(--brand, #0f9e75)" }}
                >
                  K
                </span>
                <span className="text-[15px] font-bold tracking-tight">
                  kasi
                  <span style={{ color: "var(--brand, #0f9e75)" }}>stay</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav sections */}
      <SidebarContent>
        {visibleSections.map((section) => (
          <React.Fragment key={section.label}>
            {section.isAdmin && <SidebarSeparator />}
            <SidebarGroup>
              <SidebarGroupLabel
                style={
                  section.isAdmin
                    ? { color: "var(--brand, #0f9e75)" }
                    : undefined
                }
              >
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <NavItemRow key={item.href} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatar ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
