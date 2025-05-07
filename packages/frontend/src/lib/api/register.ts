import { RegisterInput, RegisterResponse } from '@shared/dto/auth.dto'
import clientApi from '../axios'

export const registerUser = async (data: RegisterInput): Promise<RegisterResponse> => {
  console.log('data', data)
  const response = await clientApi.post('/api/auth/register', data)
  return response.data
}

