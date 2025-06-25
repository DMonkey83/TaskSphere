"use client";

import {
  ProjectsList,
  ProjectsHeader,
  ProjectsFilters,
  ProjectsStats,
} from "@/components/projects";

import { CreateProjectModal } from "../projects/create-project-modal";

export default function ClientProjects() {
  return (
    <div className="space-y-6">
      <ProjectsHeader />
      <div className="flex justify-between items-center">
        <ProjectsFilters />
        <CreateProjectModal />
      </div>
      <ProjectsStats />
      <ProjectsList />
    </div>
  );
}
