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
