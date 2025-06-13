import { MdCircle } from "react-icons/md";

import { useSidebar } from "@/store/use-sidebar-store";

export function AppLogo() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex items-center gap-3">
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MdCircle className="size-4" />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-bold text-lg">TaskSphere</span>
          <span className="text-xs text-muted-foreground">
            Project Management
          </span>
        </div>
      )}
    </div>
  );
}
