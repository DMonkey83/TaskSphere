// packages/api/src/users/types/user.types.ts

// This matches your old User entity structure
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  createdAt: Date;
  updatedAt: Date;
  account?: {
    id: string;
    name: string;
  } | null;
  hasCompletedOnboarding: boolean;
  onboardingStep: number;
  firstLoginAt?: Date | null;
}

// You can also export the Prisma type with a better name
export type { User as PrismaUser } from '../../../generated/prisma';
