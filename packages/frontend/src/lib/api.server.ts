import { z } from "zod";
import { serverApi } from "./axios";

export async function fetchServerData<T>(
  url: string,
  cookies: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await serverApi.get(url, {
      headers: {
        Cookie: cookies || "",
      },
    });
    const parsedData = schema.parse(response.data);
    return parsedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(`Validation error for ${url}:`, error.errors);
      throw new Error("Invalid data structure received from server");
    }
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}
