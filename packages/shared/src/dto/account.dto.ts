import { z } from "zod";

export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
});
