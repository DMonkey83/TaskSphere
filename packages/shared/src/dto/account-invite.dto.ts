import { join } from "path";
import { z } from "zod";

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "project_manager", "member", "viewer"]),
});
