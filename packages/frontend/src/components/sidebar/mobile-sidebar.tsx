import type React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebar } from "@/store/use-sidebar-store";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const { isOpen, toggleSidebar, isMobile } = useSidebar();

  // Don't render the mobile sidebar on desktop or during SSR
  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleSidebar}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
