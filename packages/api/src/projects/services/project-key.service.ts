import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

const PROJECT_KEY_GENERATION_LIMIT = 99;

@Injectable()
export class ProjectKeyService {
  private readonly logger = new Logger(ProjectKeyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique project key based on project name and industry
   */
  async generateProjectKey(
    projectName: string,
    industry: string,
    accountId: string,
  ): Promise<string> {
    if (!projectName?.trim()) {
      throw new BadRequestException(
        'Project name is required for key generation',
      );
    }

    const prefix = this.generateProjectPrefix(projectName);
    const industryCode = this.generateIndustryCode(industry);
    const baseKey = `${prefix}-${industryCode}`;

    return await this.ensureUniqueProjectKey(baseKey, accountId);
  }

  /**
   * Generates a 4-character prefix from project name
   */
  private generateProjectPrefix(projectName: string): string {
    const words = projectName.trim().split(/\s+/);
    let prefix = '';

    if (words.length === 1) {
      prefix = words[0].substring(0, 4).toUpperCase();
    } else if (words.length === 2) {
      prefix =
        words[0].substring(0, 2).toUpperCase() +
        words[1].substring(0, 2).toUpperCase();
    } else {
      prefix = words
        .slice(0, 4)
        .map((word) => word[0]?.toUpperCase() || 'X')
        .join('');
    }

    // Pad to exactly 4 characters
    return prefix.padEnd(4, 'X').substring(0, 4);
  }

  /**
   * Generates a 3-character industry code
   */
  private generateIndustryCode(industry: string): string {
    return (industry?.substring(0, 3) || 'GEN').toUpperCase();
  }

  /**
   * Ensures the project key is unique within the account
   */
  private async ensureUniqueProjectKey(
    baseKey: string,
    accountId: string,
  ): Promise<string> {
    const existingKeys = await this.prisma.project.findMany({
      where: { accountId, projectKey: { startsWith: baseKey } },
      select: { projectKey: true },
    });

    const existingKeySet = new Set(existingKeys.map((p) => p.projectKey));

    if (!existingKeySet.has(baseKey)) {
      return baseKey;
    }

    // Find unique suffix
    for (let suffix = 1; suffix < PROJECT_KEY_GENERATION_LIMIT; suffix++) {
      const candidate = `${baseKey}-${suffix}`;
      if (!existingKeySet.has(candidate)) {
        return candidate;
      }
    }

    throw new BadRequestException(
      `Unable to generate unique project key. Limit of ${PROJECT_KEY_GENERATION_LIMIT} reached for this name and industry combination.`,
    );
  }
}
