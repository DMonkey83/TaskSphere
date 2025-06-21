import type React from "react";

import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarWrapper>{children}</SidebarWrapper>;
}
