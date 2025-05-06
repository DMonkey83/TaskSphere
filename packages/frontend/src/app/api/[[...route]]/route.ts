import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import axios, { AxiosError } from 'axios'
import { HttpStatusCode } from '@/types/apiCalls.types';

const app = new Hono();

const BACKEND_API = 'http://localhost:3000'

app.use('*', cors({
  origin: 'http://localhost:3001',
  credentials: true
}))


// Routes
app.post('/auth/register', async (c) => {
  try {
    const body = await c.req.json()
    const { data, status } = await axios.post(`${BACKEND_API}/auth/register`, body)
    return c.json(data, status as HttpStatusCode)
  } catch (err) {
    const axiosErr = err as AxiosError
    const errorData = axiosErr.response?.data ?? { message: 'Registration failed' }
    const status = axiosErr.response?.status ?? 500
    return c.json(errorData, status as HttpStatusCode)
  }
})

export const runtime = 'edge'

export const POST = handle(app)
export const OPTIONS = handle(app)
