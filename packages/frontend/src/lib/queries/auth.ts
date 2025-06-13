import { useMutation } from "@tanstack/react-query";

import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "@shared/dto/auth.dto";

import { loginUser } from "../api/login";
import { registerUser } from "../api/register";

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: registerUser,
  });
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: loginUser,
  });
};
