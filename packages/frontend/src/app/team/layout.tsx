import type React from "react";

import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarWrapper>{children}</SidebarWrapper>;
}
