import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OnboardingDraft } from '@prisma/client'; // Changed from Onboarding to OnboardingDraft

import { UserPayload } from 'src/auth/dto/auth.dto';

import { UpdateOnboardingDraftSchema } from '@shared/dto/onboarding.dto';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDraftDto } from './dto/onboardings.dto';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);

  constructor(private prisma: PrismaService) {}

  async createDraft(userId: string, tx?: any): Promise<OnboardingDraft> {
    this.logger.log(`Creating onboarding draft for user: ${userId}`);

    const prismaClient = tx || this.prisma;

    try {
      // Check if user exists
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { id: true, accountId: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if draft already exists
      const existingDraft = await prismaClient.onboardingDraft.findFirst({
        // Changed to onboardingDraft
        where: { userId },
        select: { id: true, userId: true, completed: true },
      });

      if (existingDraft) {
        if (existingDraft.completed) {
          throw new ConflictException(
            `User ${userId} has already completed onboarding`,
          );
        }

        this.logger.warn(
          `Onboarding draft already exists for user ${userId}, returning existing draft.`,
        );

        return this.getDraftByUserId(userId);
      }

      const newDraft: OnboardingDraft =
        await prismaClient.onboardingDraft.create({
          // Changed to onboardingDraft
          data: {
            userId,
            accountId: user.accountId,
            data: {},
            completed: false,
            step: 0,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

      this.logger.log(
        `New onboarding draft created for user ${userId} with ID: ${newDraft.id}`,
      );

      return newDraft;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Error creating onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to create onboarding draft');
    }
  }

  async getDraftByUserId(userId: string): Promise<OnboardingDraft> {
    this.logger.log(`Fetching onboarding draft for user: ${userId}`);

    try {
      const draft = await this.prisma.onboardingDraft.findFirst({
        // Changed to onboardingDraft
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!draft) {
        throw new NotFoundException(
          `No onboarding draft found for user ${userId}`,
        );
      }

      return draft;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error fetching onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to fetch onboarding draft');
    }
  }

  async updateDraft(
    userId: string,
    data: UpdateOnboardingDraftDto,
    user?: UserPayload,
  ): Promise<OnboardingDraft> {
    const validatedData = UpdateOnboardingDraftSchema.parse(data);

    this.logger.log(`Updating onboarding draft for user: ${userId}`);

    try {
      const existingDraft = await this.prisma.onboardingDraft.findFirst({
        // Changed to onboardingDraft
        where: {
          userId,
          ...(user && { accountId: user.account.id }),
        },
      });

      if (!existingDraft) {
        throw new NotFoundException(
          `No onboarding draft found for user ${userId}`,
        );
      }

      if (existingDraft.completed) {
        throw new BadRequestException('Cannot update completed onboarding');
      }

      // Merge the new data with existing data instead of replacing it
      const existingData = (existingDraft.data as Record<string, any>) || {};
      const newData = (validatedData.data as Record<string, any>) || {};
      const mergedData = { ...existingData, ...newData };

      const updatedDraft = await this.prisma.onboardingDraft.update({
        // Changed to onboardingDraft
        where: { id: existingDraft.id },
        data: {
          ...validatedData,
          data: mergedData, // Use merged data instead of replacing
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Onboarding draft updated for user ${userId}`);

      return updatedDraft;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error updating onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to update onboarding draft');
    }
  }

  async completeDraft(
    userId: string,
    user?: UserPayload,
  ): Promise<OnboardingDraft> {
    this.logger.log(`Completing onboarding draft for user: ${userId}`);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const draft = await tx.onboardingDraft.findFirst({
          // Changed to onboardingDraft
          where: {
            userId,
            ...(user && { accountId: user.account.id }),
          },
        });

        if (!draft) {
          throw new NotFoundException(
            `No onboarding draft found for user ${userId}`,
          );
        }

        if (draft.completed) {
          throw new BadRequestException('Onboarding already completed');
        }

        const completedDraft = await tx.onboardingDraft.update({
          // Changed to onboardingDraft
          where: { id: draft.id },
          data: {
            completed: true,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            hasCompletedOnboarding: true,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Onboarding completed for user ${userId}`);

        return completedDraft;
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error completing onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to complete onboarding draft');
    }
  }

  async deleteDraft(userId: string, user?: UserPayload): Promise<void> {
    this.logger.log(`Deleting onboarding draft for user: ${userId}`);

    try {
      const draft = await this.prisma.onboardingDraft.findFirst({
        // Changed to onboardingDraft
        where: {
          userId,
          ...(user && { accountId: user.account.id }),
        },
      });

      if (!draft) {
        throw new NotFoundException(
          `No onboarding draft found for user ${userId}`,
        );
      }

      if (draft.completed) {
        throw new BadRequestException('Cannot delete completed onboarding');
      }

      await this.prisma.onboardingDraft.delete({
        // Changed to onboardingDraft
        where: { id: draft.id },
      });

      this.logger.log(`Onboarding draft deleted for user ${userId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error deleting onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to delete onboarding draft');
    }
  }

  async getOnboardingStats(accountId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  }> {
    this.logger.log(`Fetching onboarding stats for account: ${accountId}`);

    const [total, completed] = await Promise.all([
      this.prisma.onboardingDraft.count({
        // Changed to onboardingDraft
        where: { accountId },
      }),
      this.prisma.onboardingDraft.count({
        // Changed to onboardingDraft
        where: { accountId, completed: true },
      }),
    ]);

    const inProgress = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
}
