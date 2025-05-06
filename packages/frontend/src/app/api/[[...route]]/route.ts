import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import axios, { AxiosError } from 'axios'
import { HttpStatusCode } from '@/types/apiCalls.types';
import { getEnv } from '@shared/utils/validateEnv';

const env = getEnv()

const app = new Hono();


app.use('*', cors({
  origin: env.FRONTEND_API_URL,
  credentials: true
}))


// Routes
app.post('/auth/register', async (c) => {
  try {
    const body = await c.req.json()
    const { data, status } = await axios.post(`${env.BACKEND_API_URL}/auth/register`, body)
    return c.json(data, status as HttpStatusCode)
  } catch (err) {
    const axiosErr = err as AxiosError
    const errorData = axiosErr.response?.data ?? { message: 'Registration failed' }
    const status = axiosErr.response?.status ?? 500
    return c.json(errorData, status as HttpStatusCode)
  }
})

export const runtime = 'nodejs'

export const POST = handle(app)
export const OPTIONS = handle(app)
