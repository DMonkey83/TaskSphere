import { z } from "zod";

export const ProjectDefaultsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  industry: z
    .enum([
      "programming",
      "legal",
      "logistics",
      "marketing",
      "product",
      "other",
    ])
    .optional(),
  workflow: z
    .enum(["kanban", "scrum", "timeline", "calendar", "checklist"])
    .default("kanban"),
  status: z
    .enum(["planned", "in_progress", "on_hold", "completed", "cancelled"])
    .default("planned"),
  visibility: z.enum(["private", "team", "account"]).default("private"),
});

export const OnboardingDataSchema = z.object({
  projectDefaults: ProjectDefaultsSchema.optional(),
  personalInfo: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).default("system"),
      notifications: z.boolean().default(true),
      emailUpdates: z.boolean().default(true),
    })
    .optional(),
});

export const OnboardingDraftSchema = z.object({
  userId: z.string().uuid(),
  completed: z.boolean().default(false),
  data: OnboardingDataSchema.default({}),
  step: z.number().default(0),
});

export const UpdateOnboardingDraftSchema = z.object({
  step: z.number().optional(),
  completed: z.boolean().optional(),
  data: OnboardingDataSchema.optional(),
});

export const OnboardingDraftResponseSchema =
  UpdateOnboardingDraftSchema.partial().extend({
    id: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    createdAt: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    updatedAt: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    completedAt: z
      .string()
      .nullable()
      .transform((str) => (str ? new Date(str) : null))
      .optional(),
  });

export const OnboardingStatusSchema = z.object({
  hasOnboarding: z.boolean(),
  completed: z.boolean(),
  step: z.number(),
  needsReminder: z.boolean(),
});

export const OnboardingStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  inProgress: z.number(),
  completionRate: z.number(),
});

// Export types
export type OnboardingDraftResponse = z.infer<
  typeof OnboardingDraftResponseSchema
>;
export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;
export type OnboardingStats = z.infer<typeof OnboardingStatsSchema>;
