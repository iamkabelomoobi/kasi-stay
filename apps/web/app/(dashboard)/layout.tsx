import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/side-bar";
import { AppTopbar, type AppUserRole } from "@/components/dashboard/top-bar";

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

  const userRole = (session.user.role ?? "RENTER") as AppUserRole;
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f1e8] text-foreground">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: userRole,
          }}
        />
        <main className="min-h-0 flex-1 overflow-hidden bg-[#f4f1e8]">
          {children}
        </main>
      </div>
    </div>
  );
}
