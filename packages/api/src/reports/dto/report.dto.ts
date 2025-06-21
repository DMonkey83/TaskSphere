import { createZodDto } from 'nestjs-zod';
import { ZodType } from 'zod';

import {
  CreateReportSchema,
  UpdateReportSchema,
  ReportResponseSchema,
  ReportsListResponseSchema,
} from '@shared/dto/reports.dto';

export class CreateReportDto extends createZodDto(
  CreateReportSchema as ZodType,
) {}
export class UpdateReportDto extends createZodDto(
  UpdateReportSchema as ZodType,
) {}
export class ReportResponseDto extends createZodDto(
  ReportResponseSchema as ZodType,
) {}
export class ReportsListResponseDto extends createZodDto(
  ReportsListResponseSchema as ZodType,
) {}
