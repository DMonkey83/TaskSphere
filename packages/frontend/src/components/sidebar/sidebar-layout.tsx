import type React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar-store";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isCollapsed, isMobile } = useSidebar();

  if (isMobile) {
    return null; // Mobile sidebar is handled by MobileSidebar
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">{children}</div>
    </aside>
  );
}

interface SidebarSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarSectionProps) {
  return <div className={cn("border-b p-4", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: SidebarSectionProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-4", className)}>{children}</div>
  );
}

export function SidebarFooter({ children, className }: SidebarSectionProps) {
  return <div className={cn("border-t p-4", className)}>{children}</div>;
}

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64",
        className
      )}
    >
      {children}
    </div>
  );
}
