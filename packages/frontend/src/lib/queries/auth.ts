import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/register";
import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from "@shared/dto/auth.dto";
import { loginUser } from "../api/login";

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: registerUser
  })
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: loginUser
  })
}
