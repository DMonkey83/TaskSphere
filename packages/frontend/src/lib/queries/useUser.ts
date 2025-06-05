import { useQuery } from "@tanstack/react-query";
import { fetchUserClient } from "@/lib/api/user";
import { UserResponse } from "@shared/dto/user.dto";

export function useUserQuery() {
  return useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: fetchUserClient,
  });
}
