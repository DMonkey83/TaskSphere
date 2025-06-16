import { z } from "zod";

import { TeamsResponse, TeamsResponseSchema } from "@shared/dto/team.dto";

import clientApi from "../axios";

export async function fetchTeamsClient(
  accountId: string
): Promise<TeamsResponse> {
  try {
    const response = await clientApi.get<TeamsResponse>(`/api/teams`);
    console.log("Fetched teams data:", response.data);
    return Array.isArray(response.data)
      ? TeamsResponseSchema.parse(response.data)
      : [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/teams/account/:accountId:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    console.error("Error fetching teams data:", error);
    throw error;
  }
}
