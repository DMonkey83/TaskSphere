import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { AxiosError } from 'axios';
import { HttpStatusCode } from '@/types/apiCalls.types';
import { serverApi } from '@/lib/axios';

const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:3000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposeHeaders: ['Set-Cookie'],
  })
);

// Utility: forward Set-Cookie headers
import { Context } from 'hono';

const forwardSetCookies = (c: Context, headers: Record<string, string | string[] | undefined>) => {
  const setCookieHeaders = headers['set-cookie'];
  const cookies = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : setCookieHeaders ? [setCookieHeaders] : [];

  cookies.forEach((cookie: string) => {
    c.header('Set-Cookie', cookie, { append: true });
  });
};

// Auth: Register
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { data, status, headers } = await serverApi.post(`/auth/register`, body);
    forwardSetCookies(c, headers as Record<string, string | string[]>);
    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? { message: 'Registration failed' };
    const status = axiosErr.response?.status ?? 500;
    return c.json(errorData, status as HttpStatusCode);
  }
});

// Auth: Login
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { data, status, headers } = await serverApi.post(`/auth/login`, body, {
      withCredentials: true,
    });
    forwardSetCookies(c, headers as Record<string, string | string[]>);
    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? { message: 'Login failed' };
    const status = axiosErr.response?.status ?? 500;
    return c.json(errorData, status as HttpStatusCode);
  }
});

// Auth: Refresh
app.post('/api/auth/refresh', async (c) => {
  try {
    const cookieHeader = c.req.header('cookie') || '';
    const { data, status, headers } = await serverApi.post(
      `/auth/refresh`,
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
        withCredentials: true,
      }
    );
    forwardSetCookies(c, headers as Record<string, string | string[]>);
    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? { message: 'Refresh failed' };
    const status = axiosErr.response?.status ?? 500;
    return c.json(errorData, status as HttpStatusCode);
  }
});

// Proxy fallback for other API routes
app.all('*', async (c) => {
  const path = c.req.path.replace('/api', '');

  // Prevent double handling of /auth/refresh
  if (path === '/auth/refresh') {
    return c.json({ message: 'Route already handled directly.' }, 400);
  }

  try {
    const cookieHeader = c.req.header('cookie') || '';
    const method = c.req.method.toLowerCase();
    const body =
      ['post', 'put', 'patch'].includes(method) ? await c.req.json() : undefined;

    const { data, status, headers } = await serverApi({
      method,
      url: path,
      headers: {
        Cookie: cookieHeader,
      },
      data: body,
      withCredentials: true,
    });

    forwardSetCookies(c, headers as Record<string, string | string[]>);
    console.log('response, body', data)
    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? { message: 'Request failed' };
    const status = axiosErr.response?.status ?? 500;
    console.error(`Proxy error for ${c.req.method} ${c.req.path}:`, errorData);
    return c.json(errorData, status as HttpStatusCode);
  }
});

export const runtime = 'nodejs';
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
