import { MdAdd, MdFolder } from "react-icons/md";
import { ProjectItem } from "./project-item";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/sidebar.types";
import { useSidebar } from "@/store/use-sidebar-store";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const {isCollapsed} = useSidebar();

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {projects.map((project) => (
          <Button
            key={project.id}
            variant="ghost"
            size="icon"
            className="w-full"
          >
            <MdFolder className="h-4 w-4" />
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="w-full">
          <MdAdd className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Projects
      </h3>
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
      <Button variant="ghost" className="w-full justify-start gap-3">
        <MdAdd className="h-4 w-4" />
        <span>Add Project</span>
      </Button>
    </div>
  );
}
