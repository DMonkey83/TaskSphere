import { create } from "zustand";

import { TaskResponse } from "@shared/dto/tasks.dto";

interface TaskState {
  tasks: TaskResponse[];
  setTasks: (tasks: TaskResponse[]) => void;
  addTask: (task: TaskResponse) => void;
  updateTask: (updated: TaskResponse) => void;
  removeTask: (id: string) => void;
  totalTaskCount: number;
  setTotal: (total: number) => void;
}

export const taskStore = create<TaskState>((set) => ({
  tasks: [],
  totalTaskCount: 0,
  setTotal: (total) => set({ totalTaskCount: total }),
  addTask: (task) =>
    set((state) => {
      if (state.tasks.some((t) => t.id === task.id)) return state;
      return { tasks: [...state.tasks, task] };
    }),
  updateTask: (updated: TaskResponse) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === updated.id ? { ...t, ...updated } : t
      ),
    })),
  removeTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  setTasks: (tasks) => set({ tasks }),
}));
