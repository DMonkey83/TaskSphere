"use client"

import { create } from "zustand"
import { persist, StorageValue } from "zustand/middleware"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect } from "react"

// Cookie utilities for client-side only
const COOKIE_NAME = "sidebar-collapsed"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

// Custom storage object that uses cookies (client-side only)
const cookieStorage = {
  getItem: () => {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`))
    if (match) {
      try {
        return JSON.parse(match[2]) as StorageValue<SidebarState>
      } catch {
        return null
      }
    }
    return null
  },
  setItem: (_, value) => {
    if (typeof document === "undefined") return
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  },
  removeItem: () => {
    if (typeof document === "undefined") return
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  },
}

interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  toggleSidebar: () => void
  toggleCollapse: () => void
  setIsOpen: (isOpen: boolean) => void
  setIsCollapsed: (isCollapsed: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: COOKIE_NAME,
      storage: cookieStorage,
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Only persist isCollapsed
      skipHydration: true, // Skip hydration to prevent SSR mismatch
    },
  ),
)

// Hook to handle mobile sidebar behavior
export function useSidebar() {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapse, setIsOpen } = useSidebarStore()
  const isMobile = useIsMobile()

  // Hydrate the store on mount to prevent SSR mismatch
  useEffect(() => {
    useSidebarStore.persist.rehydrate()
  }, [])

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [isMobile, isOpen, setIsOpen])

  return {
    isOpen,
    isCollapsed,
    toggleSidebar,
    toggleCollapse,
    isMobile,
  }
}
