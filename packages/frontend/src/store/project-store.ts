import { ProjectResponse } from "@shared/dto/projects.dto";
import { create } from "zustand";

interface ProjectState {
  projects: ProjectResponse[];
  setProjects: (projects: ProjectResponse[]) => void;
  teamProjects: ProjectResponse[];
  setTeamProjects: (projects: ProjectResponse[]) => void;
}

export const projectStore = create<ProjectState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  teamProjects: [],
  setTeamProjects: (projects) => set({ teamProjects: projects }),
}));
