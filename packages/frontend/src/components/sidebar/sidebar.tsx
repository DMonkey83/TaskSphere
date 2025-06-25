"use client";

import { useSetupStores } from "@/hooks/useSetupStores";
import { useProjectsQuery, useTeamsQuery, useUserQuery } from "@/lib/queries";
import { navigationItems, teamItems, projects } from "@/lib/sidebar-config";

import { AppLogo } from "./app-logo";
import { NavigationSection } from "./navigation-section";
import { ProjectsSection } from "./project-section";
import { SidebarContent, SidebarHeader, SidebarFooter } from "./sidebar-layout";
import { TeamSwitcher } from "./team-switcher";
import { UserSection } from "./user-section";

export function AppSidebar() {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useUserQuery();
  const accountId = user?.account?.id;
  const {
    data: teams,
    isLoading: teamsLoading,
    isError: teamsError,
  } = useTeamsQuery(accountId!, {
    enabled: !!accountId,
  });

  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjectsQuery(accountId!, {
    enabled: !!accountId,
  });
  console.log("projects", projectsData);

  useSetupStores({
    user,
    account: {
      name: user?.account?.name || "",
    },
    teams,
    projects: projectsData,
  });
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
        {userError ||
          teamsError ||
          (projectsError && <div>Error loading sidebar.</div>)}
        {userLoading || teamsLoading || projectsLoading ? (
          <div>...Loading</div>
        ) : (
          <UserSection />
        )}
      </SidebarFooter>
    </>
  );
}
