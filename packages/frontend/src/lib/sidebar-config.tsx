import { NavigationItem, Project } from "@/types/sidebar.types";
import {
  MdDashboard,
  MdBarChart,
  MdCalendarToday,
  MdPeople,
  MdSettings,
} from "react-icons/md";

export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", icon: MdDashboard, href: "/dashboard" },
  { name: "Analytics", icon: MdBarChart, href: "/dashboard/analytics" },
  { name: "Calendar", icon: MdCalendarToday, href: "/dashboard/calendar" },
];

export const teamItems: NavigationItem[] = [
  { name: "Team Members", icon: MdPeople, href: "/dashboard/team" },
  { name: "Team Settings", icon: MdSettings, href: "/dashboard/team/settings" },
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
