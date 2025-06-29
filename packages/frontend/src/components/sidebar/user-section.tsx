import { MdPerson, MdSettings, MdLogout } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store/use-sidebar-store";
import { userStore } from "@/store/user-store";

const userActions = [
  { name: "Profile", icon: MdPerson, href: "/profile" },
  { name: "Settings", icon: MdSettings, href: "/settings" },
  { name: "Logout", icon: MdLogout, href: "/logout" },
];

export function UserSection() {
  const { isCollapsed } = useSidebar();
  const { user } = userStore();

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
        <a href="/profile">
          <MdPerson className="h-4 w-4" />
          <span>{user.email}</span>
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
