import { MdArrowForward } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/dashboard.types";

interface ProjectProgressProps {
  projects: Project[];
}

export function ProjectProgress({ projects }: ProjectProgressProps) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Track your active projects</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
          <a href="/projects">
            View all
            <MdArrowForward className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
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
  );
}
