import {
  MdDashboard,
  MdBarChart,
  MdCalendarToday,
  MdPeople,
  MdSettings,
} from "react-icons/md";

import { NavigationItem, Project, Team, User } from "@/types/sidebar.types";

export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", icon: MdDashboard, href: "/dashboard" },
  { name: "Analytics", icon: MdBarChart, href: "/analytics" },
  { name: "Calendar", icon: MdCalendarToday, href: "/calendar" },
];

export const teamItems: NavigationItem[] = [
  { name: "Team Members", icon: MdPeople, href: "/team" },
  { name: "Team Settings", icon: MdSettings, href: "/team/settings" },
];

export const projects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    items: [
      { id: "1-1", name: "Homepage" },
      { id: "1-2", name: "About Page" },
      { id: "1-3", name: "Contact Page" },
    ],
  },
  {
    id: "2",
    name: "Mobile App",
    items: [
      { id: "2-1", name: "Authentication" },
      { id: "2-2", name: "Dashboard" },
      { id: "2-3", name: "Settings" },
    ],
  },
];

export const teams: Team[] = [
  { id: "1", name: "Acme Inc", logo: "A" },
  { id: "2", name: "Product Team", logo: "P" },
  { id: "3", name: "Marketing", logo: "M" },
];

export const user: User = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/placeholder.svg?height=32&width=32",
};
