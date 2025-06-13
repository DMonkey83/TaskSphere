import { createZodDto } from 'nestjs-zod';

import { OnboardingDraftSchema } from '@shared/dto/onboarding.dto';

export class OnboardingDraftDto extends createZodDto(OnboardingDraftSchema) {}
