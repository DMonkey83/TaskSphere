import { createZodDto } from 'nestjs-zod';

import { OnboardingDraftSchema } from '../../../../shared/src/dto/onboarding.dto';

export class OnboardingDraftDto extends createZodDto(OnboardingDraftSchema) {}
