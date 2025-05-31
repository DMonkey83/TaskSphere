import { UserResponse, UserResponseSchema } from "@shared/dto/user.dto";
import clientApi from "../axios";

export async function fetchUserClient(): Promise<UserResponse> {
  const response = await clientApi.get<UserResponse>("api/users/me");
  if (!response.data) {
    throw new Error("User data not found");
  }
  return UserResponseSchema.parse(response.data);
}
