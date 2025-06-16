import { createZodDto } from 'nestjs-zod';

import {
  OnboardingDraftSchema,
  UpdateOnboardingDraftSchema,
} from '@shared/dto/onboarding.dto';

export class OnboardingDraftDto extends createZodDto(OnboardingDraftSchema) {}
export class UpdateOnboardingDraftDto extends createZodDto(
  UpdateOnboardingDraftSchema,
) {}
