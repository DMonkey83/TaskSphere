import { MdArrowForward } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStat } from "@/types/dashboard.types"

interface StatCardProps {
  stat: DashboardStat
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
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
  )
}
