import { useEffect } from "react";

import { ProjectsListResponse } from "@shared/dto/projects.dto";
import { UserResponse } from "@shared/dto/user.dto";

interface Account {
  name: string;
}

interface SetupProjectsStoresParams {
  user: UserResponse | undefined;
  account: Account;
  projects: ProjectsListResponse;
}

export function useSetupProjectsStores({
  user,
  account,
  projects,
}: SetupProjectsStoresParams) {
  useEffect(() => {
    // Here you would typically set up your global state stores
    // For example, if using Zustand, Redux, or any other state management

    if (user) {
      // Set user data in store
      console.log("Setting up user store:", user);
    }

    if (account) {
      // Set account data in store
      console.log("Setting up account store:", account);
    }

    if (projects) {
      // Set projects data in store
      console.log("Setting up projects store:", projects);
    }

    // Example: If you're using a projects store
    // projectsStore.setProjects(projects);
    // userStore.setUser(user);
    // accountStore.setAccount(account);
  }, [user, account, projects]);

  // Return any store states or actions you need
  return {
    // You can return store states here if needed
    // isLoading: projectsStore.isLoading,
    // error: projectsStore.error,
  };
}
