import { create } from "zustand";
import { RoleEnum } from "@shared/enumsTypes";


export interface User {
  id: string;
  email: string;
  role: RoleEnum; // Assuming RoleEnum is defined elsewhere
  lastName?: string; // Optional, can be added later
  firstName?: string; // Optional, can be added later
  accountId: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const userStore = create<UserState>((set) => ({
  user: {
    id: "",
    email: "",
    role: RoleEnum.Member, // Default role, can be changed later
    accountId: "",
  },
  setUser: (user) => set({ user }),
}))
