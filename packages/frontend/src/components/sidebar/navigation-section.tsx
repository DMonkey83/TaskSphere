import { NavigationItem } from "@/types/sidebar.types";
import { NavigationButton } from "./navigation-button";
import { useSidebar } from "@/store/use-sidebar-store";

interface NavigationSectionProps {
  title?: string;
  items: NavigationItem[];
}

export function NavigationSection({ title, items }: NavigationSectionProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="space-y-2">
      {title && !isCollapsed && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => (
        <NavigationButton key={item.name} item={item} />
      ))}
    </div>
  );
}
