import { MdTask } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { CreateProjectModal } from "@/features/projects/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/create-task-modal";

export function WelcomeSection({ name }: { name?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight capitalize">
          Welcome {name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects today.
        </p>
      </div>
      <div className="flex gap-2">
        <CreateProjectModal />
        <CreateTaskModal />
      </div>
    </div>
  );
}
