"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Only persist isCollapsed
    }
  )
);

// Hook to handle mobile sidebar behavior
export function useSidebar() {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapse, setIsOpen } =
    useSidebarStore();
  const isMobile = useIsMobile();

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen, setIsOpen]);

  return {
    isOpen,
    isCollapsed,
    toggleSidebar,
    toggleCollapse,
    isMobile,
  };
}
