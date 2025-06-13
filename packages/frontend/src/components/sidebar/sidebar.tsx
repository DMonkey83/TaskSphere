"use client";

import { navigationItems, teamItems, projects } from "@/lib/sidebar-config";

import { AppLogo } from "./app-logo";
import { NavigationSection } from "./navigation-section";
import { ProjectsSection } from "./project-section";
import { SidebarContent, SidebarHeader, SidebarFooter } from "./sidebar-layout";
import { TeamSwitcher } from "./team-switcher";
import { UserSection } from "./user-section";

export function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <div className="space-y-4">
          <AppLogo />
          <TeamSwitcher />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-6">
          <NavigationSection title="Navigation" items={navigationItems} />
          <ProjectsSection projects={projects} />
          <NavigationSection title="Team" items={teamItems} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <UserSection />
      </SidebarFooter>
    </>
  );
}
