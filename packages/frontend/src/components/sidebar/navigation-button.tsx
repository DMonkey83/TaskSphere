import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar-store";
import { NavigationItem } from "@/types/sidebar.types";

interface NavigationButtonProps {
  item: NavigationItem;
}

export function NavigationButton({ item }: NavigationButtonProps) {
  const { isCollapsed } = useSidebar();

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        isCollapsed ? "px-2" : "px-3"
      )}
      asChild
    >
      <a href={item.href}>
        <item.icon className="h-4 w-4" />
        {!isCollapsed && <span>{item.name}</span>}
      </a>
    </Button>
  );
}
