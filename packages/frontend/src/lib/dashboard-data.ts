import { Activity, DashboardStat, Deadline, Project } from "@/types/dashboard.types";

export const dashboardData = {
  stats: [
    { label: "Active Projects", value: 0, href: "/dashboard/projects" },
    { label: "Open Tasks", value: 0, href: "/dashboard/tasks" },
    { label: "Team Members", value: 0, href: "/dashboard/team" },
    { label: "Upcoming Sprints", value: 0, href: "/dashboard/sprints" },
  ] as DashboardStat[],

  recentProjects: [
    { id: "1", name: "Website Redesign", progress: 68, dueDate: "May 30" },
    { id: "2", name: "Mobile App", progress: 32, dueDate: "June 15" },
    { id: "3", name: "Marketing Campaign", progress: 87, dueDate: "June 22" },
  ] as Project[],

  activities: [
    {
      id: "1",
      user: { name: "John Doe", avatar: "/placeholder.svg?height=32&width=32", initials: "JD" },
      action: "completed task",
      target: "Homepage Design",
      project: "Website Redesign",
      time: "2 hours ago",
    },
    {
      id: "2",
      user: { name: "Sarah Smith", avatar: "/placeholder.svg?height=32&width=32", initials: "SS" },
      action: "commented on",
      target: "User Authentication",
      project: "Mobile App",
      time: "4 hours ago",
    },
    {
      id: "3",
      user: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32", initials: "MJ" },
      action: "created sprint",
      target: "June Sprint",
      project: "Marketing Campaign",
      time: "Yesterday",
    },
    {
      id: "4",
      user: { name: "Emily Davis", avatar: "/placeholder.svg?height=32&width=32", initials: "ED" },
      action: "assigned task to",
      target: "Alex Wilson",
      project: "Website Redesign",
      time: "Yesterday",
    },
  ] as Activity[],

  upcomingDeadlines: [
    { id: "1", task: "Finalize Homepage", project: "Website Redesign", dueDate: "Tomorrow" },
    { id: "2", task: "User Testing", project: "Mobile App", dueDate: "In 3 days" },
    { id: "3", task: "Content Creation", project: "Marketing Campaign", dueDate: "Next week" },
  ] as Deadline[],
}

