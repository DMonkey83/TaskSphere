import { LoginInput, LoginResponse } from "@shared/dto/auth.dto";
import clientApi from '../axios'

export const loginUser = async (data: LoginInput): Promise<LoginResponse> => {
    const response = await clientApi.post('/api/auth/login', data)
    return response.data
}