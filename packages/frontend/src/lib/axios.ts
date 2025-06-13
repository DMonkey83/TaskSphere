// packages/frontend/src/lib/axios.ts
import https from "https";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve("");
  });
  failedQueue = [];
};

export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FRONTEND_API_URL || "https://localhost:3001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === "production",
  }),
});

export const serverApi = axios.create({
  baseURL: process.env.BACKEND_API_URL || "https://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === "production",
  }),
});

const refreshAccessToken = async (
  isServer: boolean,
  cookieString?: string
): Promise<{ success: boolean; newCookies?: string }> => {
  try {
    if (isServer) {
      if (!cookieString)
        throw new Error("No cookies provided for server-side refresh");
      console.log("Server-side refresh with cookies:", cookieString);
      const response = await clientApi.post(
        "/api/auth/refresh",
        {},
        {
          headers: { Cookie: cookieString },
          withCredentials: true,
        }
      );
      console.log("Server-side refresh response:", response.data);
      const setCookieHeaders = response.headers["set-cookie"];
      let newCookies = "";
      if (setCookieHeaders) {
        console.log("Refresh set-cookie headers:", setCookieHeaders);
        const cookies = [];
        for (const cookie of setCookieHeaders) {
          const [nameValue] = cookie.split(";");
          const [name, value] = nameValue.split("=");
          if (name === "access_token" || name === "refresh_token") {
            cookies.push(`${name}=${value}`);
          }
        }
        newCookies = cookies.join("; ");
      }
      return { success: true, newCookies };
    } else {
      console.log("Client-side refresh");
      const response = await clientApi.post(
        "/api/auth/refresh",
        {},
        {
          withCredentials: true,
        }
      );
      console.log("Client-side refresh response:", response.data);
      return { success: true };
    }
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return { success: false };
  }
};

const setupInterceptor = (
  api: typeof clientApi | typeof serverApi,
  isServer: boolean
) => {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }
        isRefreshing = true;
        try {
          const cookieString = isServer
            ? (originalRequest.headers?.["Cookie"] as string)
            : undefined;
          const refreshResult = await refreshAccessToken(
            isServer,
            cookieString
          );
          if (!refreshResult.success) {
            processQueue(error);
            isRefreshing = false;
            return Promise.reject(new Error("Refresh token expired"));
          }
          if (isServer && refreshResult.newCookies) {
            console.log(
              "Updating request cookies with:",
              refreshResult.newCookies
            );
            originalRequest.headers = {
              ...originalRequest.headers,
              Cookie: refreshResult.newCookies,
            };
          }
          processQueue(null);
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as AxiosError);
          isRefreshing = false;
          return Promise.reject(new Error("Refresh token expired"));
        }
      }
      console.error(`${isServer ? "Server" : "Client"} API error:`, error);
      return Promise.reject(error);
    }
  );
};

setupInterceptor(clientApi, false);
setupInterceptor(serverApi, true);

export default clientApi;
