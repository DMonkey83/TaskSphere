import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { AxiosError } from "axios";
import { HttpStatusCode } from "@/types/apiCalls.types";
import { getEnv } from "@shared/utils/validateEnv";
import { serverApi } from "@/lib/axios";
import { getCookie, setCookie } from "hono/cookie";

const env = getEnv();

const app = new Hono();

// Enable CORS
// Middleware: CORS and cookie parsing
app.use('*', cors({
  origin: env.FRONTEND_API_URL,
  credentials: true,
}));

// Proxy: Register route
app.post("/api/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    console.log("body", body);
    const { data, status } = await serverApi.post(`/auth/register`, body);
    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? {
      message: "Registration failed",
    };
    const status = axiosErr.response?.status ?? 500;
    return c.json(errorData, status as HttpStatusCode);
  }
});

// Proxy: Login route
app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received login request with body:", body);

    const { data, status, headers } = await serverApi.post(
      `/auth/login`,
      body,
      {
        withCredentials: true,
      }
    );
    if (headers["set-cookie"]) {
      headers["set-cookie"].forEach((cookie: string) => {
        c.header("Set-Cookie", cookie, { append: true });
      });
    } else {
      console.log("No Set-Cookie headers received from backend");
    }

    return c.json(data, status as HttpStatusCode);
  } catch (err) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? { message: "Login failed" };
    const status = axiosErr.response?.status ?? 500;
    return c.json(errorData, status as HttpStatusCode);
  }
});

// Proxy: Refresh token route
app.post("/api/auth/refresh", async (c) => {
  try {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) {
      return c.json(
        { message: "No refresh token provided" },
        401 as HttpStatusCode
      );
    }
    const { data, status } = await serverApi.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    // Update access_token cookie
    if (data.access_token) {
      setCookie(c, "access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
        maxAge: 900, // 15 minutes
      });
    }
    return c.json(data, status as HttpStatusCode);
  } catch (err: unknown) {
    const axiosErr = err as AxiosError;
    const errorData = axiosErr.response?.data ?? {
      message: "Failed to refresh token",
    };
    const status = axiosErr.response?.status ?? 401;
    return c.json(errorData, status as HttpStatusCode);
  }
});

app.all("*", (c) => {
  console.log("Unmatched route:", c.req.method, c.req.path);
  return c.json({ error: "Not found" }, 404);
});

// Required by Next.js App Router
export const runtime = "nodejs";

const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
