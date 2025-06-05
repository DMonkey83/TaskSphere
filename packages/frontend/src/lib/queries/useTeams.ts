import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { TeamsResponse } from "@shared/dto/team.dto";
import { fetchTeamsClient } from "../api/teams";

type TeamsQueryKey = ["teams", { accountId: string }];

export const useTeamsQuery = (
  accountId: string,
  options?: Omit<
    UseQueryOptions<TeamsResponse, unknown, TeamsResponse, TeamsQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TeamsResponse, unknown> => {
  return useQuery<TeamsResponse, unknown, TeamsResponse, TeamsQueryKey>({
    queryKey: ["teams", { accountId }],
    queryFn: ({ queryKey }) => {
      const [, { accountId }] = queryKey;
      return fetchTeamsClient(accountId);
    },
    ...options,
  });
};
