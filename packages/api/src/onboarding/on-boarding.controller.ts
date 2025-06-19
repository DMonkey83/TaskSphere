import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UpdateOnboardingDraftDto } from './dto/onboardings.dto';
import { OnBoardingService } from './on-boarding.service';
import { UserPayload } from '../auth/dto/auth.dto';
import { GetUser } from '../auth/get-user.decorator';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnBoardingController {
  private readonly logger = new Logger(OnBoardingController.name);
  constructor(private readonly onboardingService: OnBoardingService) {}

  @Get('draft')
  async getDraft(@GetUser() user: UserPayload) {
    return this.onboardingService.getDraftByUserId(user.userId);
  }

  @Post('draft')
  async createDraft(@GetUser() user: UserPayload) {
    return this.onboardingService.createDraft(user.userId);
  }

  @Put('draft')
  async updateDraft(
    @GetUser() user: UserPayload,
    @Body() updateData: UpdateOnboardingDraftDto,
  ) {
    return this.onboardingService.updateDraft(user.userId, updateData, user);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeDraft(@GetUser() user: UserPayload) {
    return this.onboardingService.completeDraft(user.userId, user);
  }

  @Delete('draft')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDraft(@GetUser() user: UserPayload) {
    await this.onboardingService.deleteDraft(user.userId, user);
  }

  @Get('stats')
  async getStats(@GetUser() user: UserPayload) {
    if (!user.account?.id) {
      throw new Error('User must belong to an account');
    }
    return this.onboardingService.getOnboardingStats(user.account.id);
  }

  @Get('status')
  async getOnboardingStatus(@GetUser() user: UserPayload) {
    try {
      const draft = await this.onboardingService.getDraftByUserId(user.userId);
      return {
        hasOnboarding: true,
        completed: draft.completed,
        step: draft.step,
        needsReminder: !draft.completed,
      };
    } catch {
      // No onboarding draft exists, but user might still need onboarding
      // Check if user has completed onboarding globally
      const userCompletedOnboarding = false;

      return {
        hasOnboarding: false,
        completed: userCompletedOnboarding,
        step: 0,
        needsReminder: !userCompletedOnboarding, // Remind if they haven't completed onboarding
      };
    }
  }
}
