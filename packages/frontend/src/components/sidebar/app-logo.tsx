import Image from "next/image";

import { useSidebar } from "@/store/use-sidebar-store";

export function AppLogo() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex justify-start">
      {isCollapsed && (
        <div className="flex aspect-square size-30 h-8 items-center justify-start ">
          <Image
            src="/assets/TaskSphere.png"
            alt="TaskSphere"
            width={120}
            height={30}
            priority
          />
        </div>
      )}
      {!isCollapsed && (
        <div className="flex aspect-square size-70 h-8 items-center justify-start ">
          <Image
            src="/assets/TaskSphere.png"
            alt="TaskSphere"
            width={160}
            height={40}
            priority
          />
        </div>
      )}
    </div>
  );
}
