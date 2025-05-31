import axios from "axios";

export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FRONTEND_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const serverApi = axios.create({
  baseURL: process.env.BACKEND_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

clientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('Client API error:', err);
    return Promise.reject(err)
  }
)

serverApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('Server API error:', err);
    return Promise.reject(err)
  }
)

export default clientApi;
