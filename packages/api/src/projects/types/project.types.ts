import {
  ProjectIndustryEnum,
  ProjectStatusEnum,
} from '../../../generated/prisma';

export interface SearchProjectsParams {
  accountId: string;
  searchTerm?: string;
  status?: ProjectStatusEnum;
  industry?: ProjectIndustryEnum;
  limit: number;
  offset: number;
}
