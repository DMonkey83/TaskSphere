'use client'

import React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

interface LayoutSidebarProps {
  children: React.ReactNode
}

export const LayoutSidebar = ({ children }: LayoutSidebarProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
