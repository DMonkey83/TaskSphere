import { HiSquares2X2, HiDocumentText } from "react-icons/hi2";
import { MdFolder, MdExpandMore } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Project } from "@/types/sidebar.types";

interface ProjectItemProps {
  project: Project;
}

export function ProjectItem({ project }: ProjectItemProps) {
  // If project has a slug, use it for real project navigation
  const projectSlug = (project as { slug?: string }).slug || project.id;
  
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <MdFolder className="h-4 w-4" />
          <span className="flex-1 text-left">{project.name}</span>
          <MdExpandMore className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-7 space-y-1">
        {/* Board Views */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm text-muted-foreground"
          asChild
        >
          <a href={`/projects/${projectSlug}/board`}>
            <HiSquares2X2 className="h-3 w-3 mr-2" />
            Board
          </a>
        </Button>
        
        {/* Project Overview */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm text-muted-foreground"
          asChild
        >
          <a href={`/projects/${projectSlug}`}>
            <HiDocumentText className="h-3 w-3 mr-2" />
            Overview
          </a>
        </Button>

        {/* Legacy items for backward compatibility */}
        {project.items?.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-muted-foreground"
            asChild
          >
            <a href={`/projects/${projectSlug}/${item.id}`}>{item.name}</a>
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
