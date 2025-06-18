import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';

import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProjectsParams } from '../types/project.types';

@Injectable()
export class ProjectSearchService {
  private readonly logger = new Logger(ProjectSearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async searchProjects(params: SearchProjectsParams): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const startTime = Date.now();
    const { accountId, searchTerm, status, industry, limit, offset } = params;

    // Cap limit for performance
    const cappedLimit = Math.min(limit, 50);

    // Build the where clause dynamically
    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
      // Add search term filter if provided (min 2 characters)
      ...(searchTerm &&
        searchTerm.length >= 2 && {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              projectKey: {
                contains: searchTerm,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            // Only search description for longer queries
            ...(searchTerm.length >= 4
              ? [
                  {
                    description: {
                      contains: searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ]
              : []),
          ],
        }),
      // Add status filter if provided
      ...(status && { status }),
      // Add industry filter if provided
      ...(industry && { industry }),
    };

    // Execute both queries in a transaction for consistency
    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
        orderBy: [
          { updatedAt: 'desc' }, // Most recently updated first
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: cappedLimit,
      }),
      this.prisma.project.count({ where }),
    ]);

    const queryDuration = Date.now() - startTime;

    // Log slow queries
    if (queryDuration > 1000) {
      this.logger.warn(`Slow project search query: ${queryDuration}ms`, {
        searchTerm,
        resultCount: projects.length,
        accountId,
      });
    }

    return {
      projects,
      total,
      limit: cappedLimit,
      offset,
    };
  }

  async listProjectsPaginated(
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<{
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    this.logger.log(
      `Paginated search for account: ${accountId}, limit: ${limit}, offset: ${offset}`,
    );

    // Only cache first page requests to keep it simple and effective
    const isFirstPage = offset === 0;
    const cacheKey = `projects:paginated:${accountId}:${limit}`;

    if (isFirstPage) {
      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const where: Prisma.ProjectWhereInput = {
            accountId,
            archived: false,
          };

          const [projects, total] = await this.prisma.$transaction([
            this.prisma.project.findMany({
              where,
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                account: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                _count: {
                  select: {
                    tasks: true,
                    members: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              skip: offset,
              take: limit,
            }),
            this.prisma.project.count({ where }),
          ]);

          const result = {
            projects,
            total,
            limit,
            offset,
          };

          this.logger.log(
            `Database query: Found ${projects.length} projects for account ${accountId}`,
          );
          return result;
        },
        300, // 5 minutes TTL
      );
    }

    // Non-first page - no caching
    const where: Prisma.ProjectWhereInput = {
      accountId,
      archived: false,
    };

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    const result = {
      projects,
      total,
      limit,
      offset,
    };

    this.logger.log(
      `No cache: Found ${projects.length} projects for account ${accountId} (page ${Math.floor(offset / limit) + 1})`,
    );

    return result;
  }

  async searchProjectsByName(
    accountId: string,
    name: string,
    limit = 10,
  ): Promise<Project[]> {
    // Only search if name has meaningful length
    if (!name || name.length < 2) {
      return [];
    }

    const cappedLimit = Math.min(limit, 20);

    return (await this.prisma.project.findMany({
      where: {
        accountId,
        archived: false,
        name: {
          contains: name,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      include: {
        owner: true,
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: cappedLimit,
    })) as Project[];
  }

  async getProjectSuggestions(
    accountId: string,
    query: string,
    limit = 5,
  ): Promise<Array<{ id: string; name: string; projectKey: string }>> {
    // Only provide suggestions for meaningful queries
    if (!query || query.length < 1) {
      return [];
    }

    const cappedLimit = Math.min(limit, 10);

    return (await this.prisma.project.findMany({
      where: {
        accountId,
        archived: false,
        OR: [
          { name: { startsWith: query, mode: Prisma.QueryMode.insensitive } },
          {
            projectKey: {
              startsWith: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        projectKey: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: cappedLimit,
    })) as Array<{
      id: string;
      name: string;
      projectKey: string;
    }>;
  }
}
