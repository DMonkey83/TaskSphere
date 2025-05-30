import { MdPerson, MdSettings, MdLogout } from "react-icons/md";
import { sidebarData } from "@/lib/sidebar-data";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store/use-sidebar-store";

const userActions = [
  { name: "Profile", icon: MdPerson, href: "/dashboard/profile" },
  { name: "Settings", icon: MdSettings, href: "/dashboard/settings" },
  { name: "Logout", icon: MdLogout, href: "/logout" },
];

export function UserSection() {
  const { isCollapsed } = useSidebar();

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {userActions.map((action) => (
          <Button
            key={action.name}
            variant="ghost"
            size="icon"
            className="w-full"
            asChild
          >
            <a href={action.href}>
              <action.icon className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="ghost" className="w-full justify-start gap-3" asChild>
        <a href="/dashboard/profile">
          <MdPerson className="h-4 w-4" />
          <span>{sidebarData.user.name}</span>
        </a>
      </Button>
      {userActions.slice(1).map((action) => (
        <Button
          key={action.name}
          variant="ghost"
          className="w-full justify-start gap-3"
          asChild
        >
          <a href={action.href}>
            <action.icon className="h-4 w-4" />
            <span>{action.name}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}
