import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

import {
  CreateApprovalSchema,
  UpdateApprovalSchema,
  ApprovalResponseSchema,
  ApprovalsListResponseSchema,
} from '@shared/dto/approvals.dto';

export class CreateApprovalDto extends createZodDto(
  CreateApprovalSchema as ZodType,
) {}
export class UpdateApprovalDto extends createZodDto(
  UpdateApprovalSchema as ZodType,
) {}
export class ApprovalResponseDto extends createZodDto(
  ApprovalResponseSchema as ZodType,
) {}
export class ApprovalsListResponseDto extends createZodDto(
  ApprovalsListResponseSchema as ZodType,
) {}
