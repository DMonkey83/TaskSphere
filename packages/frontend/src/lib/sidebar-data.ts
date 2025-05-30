import { NavItem, Project, Team, User } from "@/types/sidebar.types"
import { MdBarChart, MdCalendarToday, MdDashboard } from "react-icons/md"


export const sidebarData = {
  teams: [
    { id: "1", name: "Acme Inc", logo: "A" },
    { id: "2", name: "Product Team", logo: "P" },
    { id: "3", name: "Marketing", logo: "M" },
  ] as Team[],

  projects: [
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
    {
      id: "3",
      name: "Marketing Campaign",
      items: [
        { id: "3-1", name: "Social Media" },
        { id: "3-2", name: "Email" },
        { id: "3-3", name: "Analytics" },
      ],
    },
  ] as Project[],

  mainNav: [
    { name: "Dashboard", icon: MdDashboard, href: "/dashboard" },
    { name: "Analytics", icon: MdBarChart, href: "/analytics" },
    { name: "Calendar", icon: MdCalendarToday, href: "/calendar" },
  ] as NavItem[],

  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  } as User,
}
