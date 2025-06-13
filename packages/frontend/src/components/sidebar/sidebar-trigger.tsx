import { MdMenu } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar-store";

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { toggleSidebar, toggleCollapse, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      toggleCollapse();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("h-8 w-8", className)}
    >
      <MdMenu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
