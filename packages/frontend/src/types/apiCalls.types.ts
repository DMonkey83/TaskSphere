// Define HTTP status codes for TypeScript
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 503;

// Response shape for consistency
export interface ErrorResponse {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ErrorResponse | null;
}

