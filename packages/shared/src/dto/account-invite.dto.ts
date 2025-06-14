import { z } from "zod";

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ProjectManager", "Member"]),
});
