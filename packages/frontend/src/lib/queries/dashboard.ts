import { useQuery } from "@tanstack/react-query";
import clientApi from "../axios";

export function useTeamActivitesQuery(teamId: string, accountId: string) {
  return useQuery({
    queryKey: ["teamActivities", teamId, accountId],
    queryFn: () =>
      clientApi.get(`/task-activities/team/${teamId}/account/${accountId}`),
    enabled: !!teamId && !!accountId,
  });
}

export function useGetUserByIdQuery(userId: string) {
  return useQuery({
    queryKey: ["getUserById", userId],
    queryFn: () => clientApi.get(`/users/${userId}`),
    enabled: !!userId,
  });
}

export function useGetUserByEmailQuery(email: string) {
  return useQuery({
    queryKey: ["getUserByEmail", email],
    queryFn: () => clientApi.get(`/users/${email}`),
    enabled: !!email,
  });
}
