import { AxiosError } from "axios";
import { z } from "zod";

import { LoginInput, LoginResponse, LoginResponseSchema } from "@shared/dto/auth.dto";

import clientApi from "../axios";

export const loginUser = async (data: LoginInput): Promise<LoginResponse> => {
  try {
    const response = await clientApi.post("/api/auth/login", data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    if (Object.keys(response.data).length === 0) {
      throw new Error("Login response is empty");
    }
    console.log("Login response:", response.data);
    return LoginResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error for /api/auth/login:", error.errors);
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? { message: "Login failed" };
    throw new Error(JSON.stringify(errorData));
  }
};
