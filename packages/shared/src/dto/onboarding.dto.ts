import { z } from "zod";

import {
  IndustriesZodEnum,
  ProjectStatusZodEnum,
  WorkflowZodEnum,
  VisibilityZodEnum,
} from "../enumsTypes";

export const ProjectDefaultsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  industry: IndustriesZodEnum.optional(),
  workflow: WorkflowZodEnum.default("kanban"),
  status: ProjectStatusZodEnum.default("planned"),
  visibility: VisibilityZodEnum.default("private"),
});

export const PreferncesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  notifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
});

export const PresonalInfoSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.string().optional(),
});

export const OnboardingDataSchema = z.object({
  projectDefaults: ProjectDefaultsSchema.optional(),
  personalInfo: PresonalInfoSchema.optional(),
  preferences: PreferncesSchema.optional(),
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
