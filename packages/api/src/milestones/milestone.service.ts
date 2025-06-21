import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Milestone, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';

@Injectable()
export class MilestoneService {
  private readonly logger = new Logger(MilestoneService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMilestoneDto): Promise<Milestone> {
    this.logger.log(
      `Creating milestone: ${dto.name} for project: ${dto.projectId}`,
    );

    try {
      const milestone = await this.prisma.milestone.create({
        data: {
          name: dto.name,
          description: dto.description,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          priority: dto.priority || 'medium',
          budget: dto.budget,
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

      this.logger.log(`Milestone created successfully: ${milestone.id}`);
      return milestone;
    } catch (error) {
      this.handlePrismaError(error, 'create milestone');
    }
  }

  async findById(id: string, projectId?: string): Promise<Milestone> {
    if (!id) {
      throw new BadRequestException('Milestone ID is required');
    }

    try {
      const milestone = await this.prisma.milestone.findUnique({
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

      if (!milestone) {
        throw new NotFoundException('Milestone not found');
      }

      // Validate project access if projectId provided
      if (projectId && milestone.projectId !== projectId) {
        throw new NotFoundException('Milestone not found');
      }

      return milestone;
    } catch (error) {
      this.handlePrismaError(error, 'find milestone by ID');
    }
  }

  async findByProject(
    projectId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    milestones: Milestone[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      const [milestones, total] = await Promise.all([
        this.prisma.milestone.findMany({
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
          orderBy: { dueDate: 'asc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.milestone.count({
          where: { projectId },
        }),
      ]);

      return { milestones, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find milestones by project');
    }
  }

  async update(id: string, dto: UpdateMilestoneDto): Promise<Milestone> {
    try {
      const updateData: Prisma.MilestoneUpdateInput = {
        ...dto,
        updatedAt: new Date(),
      };

      if (dto.dueDate) {
        updateData.dueDate = new Date(dto.dueDate);
      }

      const updatedMilestone = await this.prisma.milestone.update({
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

      this.logger.log(`Milestone updated successfully: ${id}`);
      return updatedMilestone;
    } catch (error) {
      this.handlePrismaError(error, 'update milestone');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.milestone.delete({
        where: { id },
      });

      this.logger.log(`Milestone deleted successfully: ${id}`);
    } catch (error) {
      this.handlePrismaError(error, 'delete milestone');
    }
  }

  async updateProgress(id: string, progress: number): Promise<Milestone> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    try {
      const updatedMilestone = await this.prisma.milestone.update({
        where: { id },
        data: {
          progress,
          updatedAt: new Date(),
          ...(progress === 100 && { status: 'completed' }),
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

      this.logger.log(`Milestone progress updated: ${id} to ${progress}%`);
      return updatedMilestone;
    } catch (error) {
      this.handlePrismaError(error, 'update milestone progress');
    }
  }

  private handlePrismaError(error: unknown, operation: string): never {
    this.logger.error(`Failed to ${operation}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException(
            'A milestone with this name already exists in the project',
          );
        case 'P2025':
          throw new NotFoundException('Milestone not found');
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
