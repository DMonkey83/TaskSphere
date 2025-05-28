
export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Team {
  label: string;
  icon: React.ReactElement;
}

export interface NavItem {
  label: string;
  href?: string;
}

export interface NavMainItem extends NavItem {
  icon: React.ReactElement;
  isActive?: boolean;
  items: NavItem[];
  isCollapsed?: boolean;
}

interface Project {
  label: string;
  href?: string;
  icon: React.ReactElement;
}

export interface SidebarProps {
  user: User;
  teams: Team[];
  navMain: NavMainItem[];
  projects: Project[];
}
