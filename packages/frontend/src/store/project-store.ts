import { create } from "zustand";

import { ProjectResponse } from "@shared/dto/projects.dto";

interface ProjectState {
  projects: ProjectResponse[];
  setProjects: (projects: ProjectResponse[]) => void;
  totalProjectCount: number;
  setTotal: (total: number) => void;
  addProject: (project: ProjectResponse) => void;
  updateProject: (updated: ProjectResponse) => void;
  removeProject: (id: string) => void;
}

export const projectStore = create<ProjectState>((set) => ({
  projects: [],
  totalProjectCount: 0,
  setTotal: (total) => set({ totalProjectCount: total }),
  addProject: (project) =>
    set((state) => {
      if (state.projects.some((p) => p.id === project.id)) return state;
      return { projects: [...state.projects, project] };
    }),
  updateProject: (updated: ProjectResponse) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === updated.id ? { ...p, ...updated } : p
      ),
    })),
  removeProject: (id: string) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  setProjects: (projects) => set({ projects }),
}));
