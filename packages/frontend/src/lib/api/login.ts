import { AxiosError } from "axios";

import { LoginInput, LoginResponse } from "@shared/dto/auth.dto";

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
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? { message: "Login failed" };
    throw new Error(JSON.stringify(errorData));
  }
};
