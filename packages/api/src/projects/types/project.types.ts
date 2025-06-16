import { ProjectIndustryEnum, ProjectStatusEnum } from '@prisma/client';

export interface SearchProjectsParams {
  accountId: string;
  searchTerm?: string;
  status?: ProjectStatusEnum;
  industry?: ProjectIndustryEnum;
  limit: number;
  offset: number;
}
