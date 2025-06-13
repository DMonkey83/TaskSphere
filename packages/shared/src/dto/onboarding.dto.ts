import { z } from "zod";

export const OnboardingDraftSchema = z.object({
  userId: z.string().uuid(),
  completed: z.boolean().default(false),
  data: z.record(z.any()).default({}),
  onboardingStep: z.number().default(0),
});

export const OnboardingDraftResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  completed: z.boolean(),
  data: z.record(z.any()),
});

