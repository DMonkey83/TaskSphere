import { z } from "zod";

import { UserResponse, UserResponseSchema } from "@shared/dto/user.dto";

import clientApi from "../axios";

export async function fetchUserClient(): Promise<UserResponse> {
  try {
    const response = await clientApi.get<UserResponse>("/api/users/me");
    console.log("User response: ", response.data);
    return UserResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error for /api/users/me:", error.errors);
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching user data:", error);
    throw error;
  }
}
