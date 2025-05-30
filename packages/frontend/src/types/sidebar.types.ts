export interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export interface ProjectItem {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  items: ProjectItem[];
}