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
        {project.items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-muted-foreground"
            asChild
          >
            <a href={`/projects/${project.id}/${item.id}`}>{item.name}</a>
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
