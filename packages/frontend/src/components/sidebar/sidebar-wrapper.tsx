"use client";

import type React from "react";

import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";
import { Sidebar, MainContent } from "@/components/sidebar/sidebar-layout";
import { SidebarTrigger } from "@/components/sidebar/sidebar-trigger";

import { AppSidebar } from "./sidebar";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <MobileSidebar>
        <AppSidebar />
      </MobileSidebar>
      <MainContent>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 shrink-0">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-semibold">TaskSphere Dashboard</h1>
        </header>
        <main className="p-4 flex-1">{children}</main>
      </MainContent>
    </div>
  );
}
