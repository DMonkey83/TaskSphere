import { create } from "zustand";

export interface Account {
  name: string;
}

interface AccountState {
  account: Account | null;
  setAccount: (account: Account | null) => void;
}

export const accountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
}));
