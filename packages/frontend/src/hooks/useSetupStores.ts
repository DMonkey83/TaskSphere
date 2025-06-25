import isEqual from "lodash.isequal";
import { useEffect } from "react";

import { accountStore } from "@/store/account-store";
import { projectStore } from "@/store/project-store";
import { taskStore } from "@/store/task-store";
import { teamStore } from "@/store/team-store";
import { userStore } from "@/store/user-store";

import { ProjectsListResponse } from "@shared/dto/projects.dto";
import { TaskListResponse } from "@shared/dto/tasks.dto";
import { TeamsResponse } from "@shared/dto/team.dto";
import { UserResponse } from "@shared/dto/user.dto";
import { RoleEnum } from "@shared/enumsTypes";

export function useTasksSetupStores({ tasks }: { tasks?: TaskListResponse }) {
  const currentTasks = taskStore((s) => s.tasks);
  const currentTaskTotal = taskStore((s) => s.totalTaskCount);

  const { setTasks, setTotal: setTasksTotal } = taskStore();

  useEffect(() => {
    if (!tasks) return;

    if (!isEqual(currentTasks, tasks.tasks)) setTasks(tasks.tasks || []);
    if (!isEqual(currentTaskTotal, tasks.total)) setTasksTotal(tasks.total);
  }, [tasks, currentTasks, currentTaskTotal, setTasks, setTasksTotal]);
}

export function useSetupStores({
  account,
  teams,
  projects,
  user,
}: {
  user?: UserResponse;
  account?: { name: string };
  teams?: TeamsResponse;
  projects?: ProjectsListResponse;
}) {
  const currentUser = userStore((s) => s.user);
  const currentAccount = accountStore((s) => s.account);
  const currentTeams = teamStore((s) => s.teams);
  const currentProjects = projectStore((s) => s.projects);
  const currentProjectTotal = projectStore((s) => s.totalProjectCount);

  const { setUser } = userStore();
  const { setAccount } = accountStore();
  const { setTeams } = teamStore();
  const { setProjects, setTotal: setProjectsTotal } = projectStore();

  useEffect(() => {
    if (!user || !account || !teams || !projects) return;

    const newUser = {
      id: user.id,
      email: user.email,
      role: user.role as RoleEnum,
      accountId: user.account.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      firstLoginAt: user.firstLoginAt ? new Date(user.firstLoginAt) : undefined,
    };

    if (!isEqual(currentUser, newUser)) setUser(newUser);
    if (!isEqual(currentAccount, account)) setAccount(account);
    if (!isEqual(currentTeams, teams)) setTeams(teams);
    if (!isEqual(currentProjects, projects.projects))
      setProjects(projects.projects || []);
    if (!isEqual(currentProjectTotal, projects.total))
      setProjectsTotal(projects.total);
  }, [
    user,
    account,
    teams,
    projects,
    currentUser,
    currentAccount,
    currentTeams,
    currentProjects,
    currentProjectTotal,
    setUser,
    setAccount,
    setTeams,
    setProjects,
    setProjectsTotal,
  ]);
}
