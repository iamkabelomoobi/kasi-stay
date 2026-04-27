import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserProfileFragment } from "@kasistay/client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  void children;

  const { getServerSession } = await import("@/lib/server-auth");
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackURL=/dashboard");
  }

  const userRole = (session.user.role ??
    "RENTER") as UserProfileFragment["role"];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          avatar: session.user.image ?? undefined,
          role: userRole,
        }}
      />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
