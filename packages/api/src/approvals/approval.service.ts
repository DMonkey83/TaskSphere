import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Approval, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalDto, UpdateApprovalDto } from './dto/approval.dto';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApprovalDto): Promise<Approval> {
    this.logger.log(`Creating approval: ${dto.type} by ${dto.requesterId}`);

    // Validate that either taskId or projectId is provided
    if (!dto.taskId && !dto.projectId) {
      throw new BadRequestException(
        'Either taskId or projectId must be provided',
      );
    }

    try {
      const approval = await this.prisma.approval.create({
        data: {
          type: dto.type,
          comments: dto.comments,
          taskId: dto.taskId,
          projectId: dto.projectId,
          requesterId: dto.requesterId,
          reviewerId: dto.reviewerId,
        },
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              taskKey: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              projectKey: true,
            },
          },
        },
      });

      this.logger.log(`Approval created successfully: ${approval.id}`);
      return approval;
    } catch (error) {
      this.handlePrismaError(error, 'create approval');
    }
  }

  async findById(id: string): Promise<Approval> {
    if (!id) {
      throw new BadRequestException('Approval ID is required');
    }

    try {
      const approval = await this.prisma.approval.findUnique({
        where: { id },
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              taskKey: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              projectKey: true,
            },
          },
        },
      });

      if (!approval) {
        throw new NotFoundException('Approval not found');
      }

      return approval;
    } catch (error) {
      this.handlePrismaError(error, 'find approval by ID');
    }
  }

  async findByUser(
    userId: string,
    role: 'requester' | 'reviewer' | 'both' = 'both',
    limit = 20,
    offset = 0,
  ): Promise<{
    approvals: Approval[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const where: Prisma.ApprovalWhereInput = {};

      if (role === 'requester') {
        where.requesterId = userId;
      } else if (role === 'reviewer') {
        where.reviewerId = userId;
      } else {
        where.OR = [{ requesterId: userId }, { reviewerId: userId }];
      }

      const [approvals, total] = await Promise.all([
        this.prisma.approval.findMany({
          where,
          include: {
            requester: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
                taskKey: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                projectKey: true,
              },
            },
          },
          orderBy: { requestedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.approval.count({ where }),
      ]);

      return { approvals, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find approvals by user');
    }
  }

  async findByProject(
    projectId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    approvals: Approval[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      const where: Prisma.ApprovalWhereInput = {
        OR: [{ projectId }, { task: { projectId } }],
      };

      const [approvals, total] = await Promise.all([
        this.prisma.approval.findMany({
          where,
          include: {
            requester: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
                taskKey: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                projectKey: true,
              },
            },
          },
          orderBy: { requestedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.approval.count({ where }),
      ]);

      return { approvals, total, limit, offset };
    } catch (error) {
      this.handlePrismaError(error, 'find approvals by project');
    }
  }

  async updateApproval(
    id: string,
    dto: UpdateApprovalDto,
    reviewerId: string,
  ): Promise<Approval> {
    try {
      // First, get the current approval to validate permissions
      const existingApproval = await this.findById(id);

      // Check if the user is authorized to review this approval
      if (
        existingApproval.reviewerId &&
        existingApproval.reviewerId !== reviewerId
      ) {
        throw new ForbiddenException(
          'You are not authorized to review this approval',
        );
      }

      // Check if approval is already processed
      if (existingApproval.status !== 'pending') {
        throw new BadRequestException(
          'This approval has already been processed',
        );
      }

      const updateData: Prisma.ApprovalUpdateInput = {
        status: dto.status,
        comments: dto.comments,
        reviewer:
          dto.reviewerId || reviewerId
            ? {
                connect: { id: dto.reviewerId || reviewerId },
              }
            : undefined,
        reviewedAt: new Date(),
      };

      const updatedApproval = await this.prisma.approval.update({
        where: { id },
        data: updateData,
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              taskKey: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              projectKey: true,
            },
          },
        },
      });

      this.logger.log(`Approval ${dto.status}: ${id} by ${reviewerId}`);
      return updatedApproval;
    } catch (error) {
      this.handlePrismaError(error, 'update approval');
    }
  }

  async approve(
    id: string,
    reviewerId: string,
    comments?: string,
  ): Promise<Approval> {
    return this.updateApproval(
      id,
      {
        id,
        status: 'approved',
        comments,
      },
      reviewerId,
    );
  }

  async reject(
    id: string,
    reviewerId: string,
    comments?: string,
  ): Promise<Approval> {
    return this.updateApproval(
      id,
      {
        id,
        status: 'rejected',
        comments,
      },
      reviewerId,
    );
  }

  async cancel(id: string, requesterId: string): Promise<Approval> {
    try {
      // First, get the current approval to validate permissions
      const existingApproval = await this.findById(id);

      // Check if the user is the requester
      if (existingApproval.requesterId !== requesterId) {
        throw new ForbiddenException(
          'You can only cancel your own approval requests',
        );
      }

      // Check if approval is still pending
      if (existingApproval.status !== 'pending') {
        throw new BadRequestException(
          'Only pending approvals can be cancelled',
        );
      }

      const updatedApproval = await this.prisma.approval.update({
        where: { id },
        data: {
          status: 'cancelled',
          reviewedAt: new Date(),
        },
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              taskKey: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              projectKey: true,
            },
          },
        },
      });

      this.logger.log(`Approval cancelled: ${id} by ${requesterId}`);
      return updatedApproval;
    } catch (error) {
      this.handlePrismaError(error, 'cancel approval');
    }
  }

  private handlePrismaError(error: unknown, operation: string): never {
    this.logger.error(`Failed to ${operation}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException('Approval not found');
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
