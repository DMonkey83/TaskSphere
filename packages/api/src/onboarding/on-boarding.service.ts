import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Onboarding } from './entities/onboardings.entity';
import { OnboardingDraftDto } from './dto/onboardings.dto';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);
  constructor(
    @InjectRepository(Onboarding)
    private onboardingRepository: Repository<Onboarding>,
  ) {}

  async createDraft(userId: string): Promise<Onboarding> {
    this.logger.log(`Creating onboarding draft for user: ${userId}`);
    try {
      const existingDraft = await this.onboardingRepository.findOne({
        where: { userId },
        relations: ['user'],
        select: ['id', 'userId'],
      });

      if (existingDraft) {
        this.logger.warn(
          `Onboarding draft already exists for user ${userId}, returning existing draft.`,
        );
        return existingDraft;
      }

      const newDraft = this.onboardingRepository.create({
        userId,
        data: {},
        completed: false,
      });

      const savedDraft = await this.onboardingRepository.save(newDraft);
      this.logger.log(`New onboarding draft created for user ${userId}`);

      return savedDraft;
    } catch (error) {
      this.logger.error(
        `Error creating onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getDraftByUserId(userId: string): Promise<Onboarding | null> {
    this.logger.log(`Fetching onboarding draft for user: ${userId}`);
    try {
      const draft = await this.onboardingRepository.findOne({
        where: { userId },
        relations: ['user'],
      });
      if (!draft) {
        this.logger.warn(`No onboarding draft found for user ${userId}`);
      }
      return draft;
    } catch (error) {
      this.logger.error(
        `Error fetching onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateDraft(
    userId: string,
    data: Partial<OnboardingDraftDto>,
  ): Promise<Onboarding> {
    this.logger.log(`Updating onboarding draft for user: ${userId}`);
    try {
      const draft = await this.getDraftByUserId(userId);
      if (!draft) {
        throw new Error(`No onboarding draft found for user ${userId}`);
      }
      Object.assign(draft, data);
      return await this.onboardingRepository.save(draft);
    } catch (error) {
      this.logger.error(
        `Error updating onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async completeDraft(userId: string): Promise<Onboarding> {
    this.logger.log(`Completing onboarding draft for user: ${userId}`);
    try {
      const draft = await this.getDraftByUserId(userId);
      if (!draft) {
        throw new Error(`No onboarding draft found for user ${userId}`);
      }
      draft.completed = true;
      return await this.onboardingRepository.save(draft);
    } catch (error) {
      this.logger.error(
        `Error completing onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async deleteDraft(userId: string): Promise<Onboarding> {
    this.logger.log(`Deleting onboarding draft for user: ${userId}`);
    try {
      const draft = await this.getDraftByUserId(userId);
      if (!draft) {
        throw new Error(`No onboarding draft found for user ${userId}`);
      }
      await this.onboardingRepository.remove(draft);
      return draft;
    } catch (error) {
      this.logger.error(
        `Error deleting onboarding draft for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
