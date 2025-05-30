"use client";

import type React from "react";
import { Sidebar, MainContent } from "@/components/sidebar/sidebar-layout";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";
import { SidebarTrigger } from "@/components/sidebar/sidebar-trigger";
import { AppSidebar } from "./sidebar";
import { useEffect } from "react";
import { useSidebarStore } from "@/store/use-sidebar-store";

interface SidebarWrapperProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarWrapper({
  children,
  defaultCollapsed = false,
}: SidebarWrapperProps) {
  const setIsCollapsed = useSidebarStore((state) => state.setIsCollapsed);

  useEffect(() => {
    if (defaultCollapsed) {
      setIsCollapsed(defaultCollapsed);
    }
  }, [defaultCollapsed, setIsCollapsed]);

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <MobileSidebar>
        <AppSidebar />
      </MobileSidebar>
      <MainContent>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-semibold">TaskSphere Dashboard</h1>
        </header>
        <main className="p-4">{children}</main>
      </MainContent>
    </div>
  );
}
