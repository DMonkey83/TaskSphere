import { useQuery } from "@tanstack/react-query";
import clientApi from "../axios";
import { UserResponse } from "@shared/dto/user.dto";
import { fetchUserClient } from "../api/user";

export function useTeamActivitesQuery(teamId: string, accountId: string) {
  return useQuery({
    queryKey: ["teamActivities", teamId, accountId],
    queryFn: () =>
      clientApi.get(`/task-activities/team/${teamId}/account/${accountId}`),
    enabled: !!teamId && !!accountId,
  });
}

export function useUserQuery(initialData: UserResponse) {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUserClient,
    initialData,
  });
}
