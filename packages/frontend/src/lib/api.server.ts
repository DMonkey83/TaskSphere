// packages/frontend/src/lib/api.server.ts
import type { z } from 'zod';

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
}

let cookieCache: string | null = null;

async function getFreshCookies(initialCookieString: string): Promise<string> {
  try {
    console.log('Attempting to refresh cookies with:', initialCookieString);
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: initialCookieString,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Refresh response:', data);
      const setCookieHeaders = response.headers.get('set-cookie');
      if (setCookieHeaders) {
        console.log('Refresh set-cookie headers:', setCookieHeaders);
        const cookies = [];
        const cookieArray = setCookieHeaders.split(', ');
        for (const cookie of cookieArray) {
          const [nameValue] = cookie.split(';');
          const [name, value] = nameValue.split('=');
          if (name === 'access_token' || name === 'refresh_token') {
            cookies.push(`${name}=${value}`);
          }
        }
        const freshCookieString = cookies.join('; ');
        console.log('Fresh cookies retrieved:', freshCookieString);
        cookieCache = freshCookieString; // Update cache
        return freshCookieString;
      }
    }
    console.error('Refresh failed:', response.status, await response.text());
  } catch (error) {
    console.error('Failed to get fresh cookies:', error);
  }
  console.log('Returning original cookies:', initialCookieString);
  return initialCookieString;
}

export async function fetchServerData<T>(
  endpoint: string,
  initialCookieString: string,
  schema: z.ZodSchema<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 200 } = options;
  let lastError: Error;
  let currentCookieString = cookieCache || initialCookieString;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`Fetching ${endpoint} with cookies: ${currentCookieString}`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/api${endpoint}`, {
        method: 'GET',
        headers: {
          Cookie: currentCookieString,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401 && attempt < maxRetries - 1) {
          console.log(`401 error on attempt ${attempt + 1} for ${endpoint}, getting fresh cookies...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          currentCookieString = await getFreshCookies(currentCookieString);
          if (currentCookieString !== initialCookieString) {
            console.log(`Updated cookie string for ${endpoint}: ${currentCookieString}`);
            cookieCache = currentCookieString; // Update cache
            continue;
          }
          console.log('No new cookies, retrying with original...');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        console.log(`Received set-cookie headers for ${endpoint}: ${setCookie}`);
      }
      const data = await response.json();
      console.log(`Data fetched from ${endpoint}:`, data);
      return schema.parse(data);
    } catch (error) {
      console.error(`Error fetching ${endpoint} on attempt ${attempt + 1}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        console.log(`Retrying ${endpoint} in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw lastError || new Error(`Failed to fetch ${endpoint} after ${maxRetries} attempts`);
}