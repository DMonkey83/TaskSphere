import { create } from "zustand";

export type RoleType = "admin" | "owner" | "project_manager" | "team_lead" | "member";

export interface User {
    id: string;
    email: string;
    role: RoleType;
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
        role: "member", // Default role, can be changed later
        accountId: "",
    },
    setUser: (user) => set({ user }),
}))