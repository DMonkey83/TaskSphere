import { UserResponse } from "@shared/dto/user.dto";
import clientApi from "../axios";
import { AxiosError } from "axios";

export const getUserById = async (userId: string): Promise<UserResponse> => {
  try {
    const response = await clientApi.get(`/users/${userId}`, {
      withCredentials: true,
      headers: { "Content-Type": "application/json", Authorization: `Bearer` },
    });
    return response.data as UserResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to fetch user",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

export const getUserByEmail = async (email: string): Promise<UserResponse> => {
  try {
    const response = await clientApi.get(`/users/${email}`, {
      withCredentials: true,
      headers: { "Content-Type": "application/json", Authorization: `Bearer` },
    });
    return response.data as UserResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to fetch user",
    };
    throw new Error(JSON.stringify(errorData));
  }
};
