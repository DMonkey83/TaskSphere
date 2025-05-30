import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MdAdd,
  MdArrowForward,
  MdCalendarToday,
  MdPeople,
  MdTask,
} from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// In a real app, this would come from your database
const dashboardData = {
  stats: [
    { label: "Active Projects", value: 12, href: "/dashboard/projects" },
    { label: "Open Tasks", value: 42, href: "/dashboard/tasks" },
    { label: "Team Members", value: 8, href: "/dashboard/team" },
    { label: "Upcoming Sprints", value: 3, href: "/dashboard/sprints" },
  ],
  recentProjects: [
    { id: "1", name: "Website Redesign", progress: 68, dueDate: "May 30" },
    { id: "2", name: "Mobile App", progress: 32, dueDate: "June 15" },
    { id: "3", name: "Marketing Campaign", progress: 87, dueDate: "June 22" },
  ],
  activities: [
    {
      id: "1",
      user: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JD",
      },
      action: "completed task",
      target: "Homepage Design",
      project: "Website Redesign",
      time: "2 hours ago",
    },
    {
      id: "2",
      user: {
        name: "Sarah Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SS",
      },
      action: "commented on",
      target: "User Authentication",
      project: "Mobile App",
      time: "4 hours ago",
    },
    {
      id: "3",
      user: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MJ",
      },
      action: "created sprint",
      target: "June Sprint",
      project: "Marketing Campaign",
      time: "Yesterday",
    },
    {
      id: "4",
      user: {
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "ED",
      },
      action: "assigned task to",
      target: "Alex Wilson",
      project: "Website Redesign",
      time: "Yesterday",
    },
  ],
  upcomingDeadlines: [
    {
      id: "1",
      task: "Finalize Homepage",
      project: "Website Redesign",
      dueDate: "Tomorrow",
    },
    {
      id: "2",
      task: "User Testing",
      project: "Mobile App",
      dueDate: "In 3 days",
    },
    {
      id: "3",
      task: "Content Creation",
      project: "Marketing Campaign",
      dueDate: "Next week",
    },
  ],
};

export default async function Dashboard() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refresh_token")?.value;

  if (!refreshToken) {
    redirect("/login");
  }
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <MdAdd className="mr-1 h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline">
            <MdTask className="mr-1 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardData.stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="px-0" asChild>
                <a href={stat.href}>
                  View all
                  <MdArrowForward className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Project progress */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Track your active projects</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
              <a href="/dashboard/projects">
                View all
                <MdArrowForward className="h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentProjects.map((project) => (
                <div key={project.id} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Due {project.dueDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2" />
                    <div className="w-10 text-sm text-muted-foreground">
                      {project.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </div>
            <MdCalendarToday className="ml-auto h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex justify-between gap-2">
                  <div>
                    <div className="font-medium">{deadline.task}</div>
                    <div className="text-sm text-muted-foreground">
                      {deadline.project}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{deadline.dueDate}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full gap-1" asChild>
              <a href="/dashboard/tasks">
                View all tasks
                <MdArrowForward className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="/dashboard/activity">
                View all
                <MdArrowForward className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <CardDescription>Latest updates across your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.user.avatar || "/placeholder.svg"}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span> in{" "}
                    <span className="font-medium">{activity.project}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team section */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-1">
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Your project collaborators</CardDescription>
          </div>
          <MdPeople className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-background">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>SS</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>ED</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarFallback>+4</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <a href="/dashboard/team">
              Manage team
              <MdArrowForward className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
