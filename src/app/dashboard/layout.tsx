"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { PermissionsProvider } from "@/lib/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("acls_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="glass h-28 animate-pulse rounded-3xl" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="glass h-32 animate-pulse rounded-3xl" />
          <div className="glass h-32 animate-pulse rounded-3xl" />
          <div className="glass h-32 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(255,196,60,0.12),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(255,196,60,0.08),transparent_55%),hsl(var(--background))]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[minmax(0,auto)_1fr]">
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
          <div className="flex flex-col gap-6 min-w-0">
            <main className="min-h-[70vh] rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-soft overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PermissionsProvider>
  );
}
