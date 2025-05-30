import type React from "react";
import { cookies } from "next/headers";
import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the collapsed state from server-side cookies
  const cookieStore = await cookies();
  const sidebarStorage = cookieStore.get("sidebar-storage");

  let defaultCollapsed = false;
  if (sidebarStorage) {
    try {
      const data = JSON.parse(sidebarStorage.value);
      defaultCollapsed = data.state?.isCollapsed || false;
    } catch (e) {
      // If parsing fails, use default value
      console.error("Failed to parse sidebar storage cookie:", e);
    }
  }

  return (
    <SidebarWrapper defaultCollapsed={defaultCollapsed}>
      {children}
    </SidebarWrapper>
  );
}
