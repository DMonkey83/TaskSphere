import { MdArrowForward, MdCalendarToday } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Deadline } from "@/types/dashboard.types"

interface UpcomingDeadlinesProps {
  deadlines: Deadline[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
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
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="flex justify-between gap-2">
              <div>
                <div className="font-medium">{deadline.task}</div>
                <div className="text-sm text-muted-foreground">{deadline.project}</div>
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
  )
}
