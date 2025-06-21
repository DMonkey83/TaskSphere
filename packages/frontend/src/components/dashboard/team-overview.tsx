import { MdArrowForward, MdPeople } from "react-icons/md";

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

export function TeamOverview() {
  return (
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
          <a href="/teams">
            Manage team
            <MdArrowForward className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
