import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Sprint, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSprintDto, UpdateSprintDto } from './dto/sprint.dto';

@Injectable()
export class SprintService {
  private readonly logger = new Logger(SprintService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSprintDto): Promise<Sprint> {
    this.logger.log(
      `Creating sprint: ${dto.name} for project: ${dto.projectId}`,
    );

    // Validate date range
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    try {
      const sprint = await this.prisma.sprint.create({
        data: {
          name: dto.name,
          goal: dto.goal,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          capacity: dto.capacity,
          commitment: dto.commitment,
          projectId: dto.projectId,
          ownerId: dto.ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      this.logger.log(`Sprint created successfully: ${sprint.id}`);
      return sprint;
    } catch (error) {
      this.handlePrismaError(error, 'create sprint');
    }
  }

  async findById(id: string, projectId?: string): Promise<Sprint> {
    if (!id) {
      throw new BadRequestException('Sprint ID is required');
    }

    try {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      // Validate project access if projectId provided
      if (projectId && sprint.projectId !== projectId) {
        throw new NotFoundException('Sprint not found');
      }

      return sprint;
    } catch (error) {
      this.handlePrismaError(error, 'find sprint by ID');
    }
  }

  async findByProject(
    projectId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    sprints: Sprint[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      const [sprints, total] = await Promise.all([
        this.prisma.sprint.findMany({
          where: { projectId },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: { startDate: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.sprint.count({
          where: { projectId },
        }),
      ]);

      return { sprints, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find sprints by project');
    }
  }

  async getActiveSprint(projectId: string): Promise<Sprint | null> {
    try {
      const activeSprint = await this.prisma.sprint.findFirst({
        where: {
          projectId,
          status: 'active',
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      return activeSprint;
    } catch (error) {
      this.handlePrismaError(error, 'find active sprint');
    }
  }

  async update(id: string, dto: UpdateSprintDto): Promise<Sprint> {
    try {
      const updateData: Prisma.SprintUpdateInput = {
        ...dto,
        updatedAt: new Date(),
      };

      if (dto.startDate) {
        updateData.startDate = new Date(dto.startDate);
      }
      if (dto.endDate) {
        updateData.endDate = new Date(dto.endDate);
      }

      // Validate date range if both dates are provided
      if (dto.startDate && dto.endDate) {
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
          throw new BadRequestException('End date must be after start date');
        }
      }

      const updatedSprint = await this.prisma.sprint.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      this.logger.log(`Sprint updated successfully: ${id}`);
      return updatedSprint;
    } catch (error) {
      this.handlePrismaError(error, 'update sprint');
    }
  }

  async startSprint(id: string): Promise<Sprint> {
    try {
      // Check if there's already an active sprint in the same project
      const sprint = await this.findById(id);
      const activeSprint = await this.getActiveSprint(sprint.projectId);

      if (activeSprint && activeSprint.id !== id) {
        throw new BadRequestException(
          'Cannot start sprint: Another sprint is already active in this project',
        );
      }

      const updatedSprint = await this.prisma.sprint.update({
        where: { id },
        data: {
          status: 'active',
          updatedAt: new Date(),
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      this.logger.log(`Sprint started: ${id}`);
      return updatedSprint;
    } catch (error) {
      this.handlePrismaError(error, 'start sprint');
    }
  }

  async completeSprint(id: string, velocity?: number): Promise<Sprint> {
    try {
      const updateData: Prisma.SprintUpdateInput = {
        status: 'completed',
        updatedAt: new Date(),
      };

      if (velocity !== undefined) {
        updateData.velocity = velocity;
      }

      const updatedSprint = await this.prisma.sprint.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      this.logger.log(`Sprint completed: ${id}`);
      return updatedSprint;
    } catch (error) {
      this.handlePrismaError(error, 'complete sprint');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.sprint.delete({
        where: { id },
      });

      this.logger.log(`Sprint deleted successfully: ${id}`);
    } catch (error) {
      this.handlePrismaError(error, 'delete sprint');
    }
  }

  private handlePrismaError(error: unknown, operation: string): never {
    this.logger.error(`Failed to ${operation}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException(
            'A sprint with this name already exists in the project',
          );
        case 'P2025':
          throw new NotFoundException('Sprint not found');
        case 'P2003':
          throw new BadRequestException(
            'Invalid reference: related record does not exist',
          );
        default:
          throw new BadRequestException(
            `Database error occurred during ${operation}: ${error.message}`,
          );
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(
        `Invalid data provided for ${operation}: ${error.message}`,
      );
    }

    throw new BadRequestException(
      `Failed to ${operation}, please try again later`,
    );
  }
}
