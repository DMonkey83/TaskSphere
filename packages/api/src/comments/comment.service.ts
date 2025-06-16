import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';

import {
  CreateCommentSchema,
  GetCommentsQueryDto,
  UpdateCommentSchema,
} from '@shared/dto/comments.dto';

import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
} from './dto/comments.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private prisma: PrismaService) {}

  async createComment(
    dto: CreateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    // Validate input with Zod
    const validatedDto = CreateCommentSchema.parse(dto);

    this.logger.log(
      `Creating comment for task ${validatedDto.taskId} by user ${user.id}`,
    );

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Validate task exists and user has access
        const task = await tx.task.findFirst({
          where: {
            id: validatedDto.taskId,
            OR: [
              { assigneeId: user.id },
              { creatorId: user.id },
              { project: { members: { some: { userId: user.id } } } },
            ],
          },
        });

        if (!task) {
          throw new NotFoundException(
            `Task with ID ${validatedDto.taskId} not found or access denied`,
          );
        }

        // Validate parent comment if provided
        if (validatedDto.parentCommentId) {
          const parentComment = await tx.comment.findFirst({
            where: {
              id: validatedDto.parentCommentId,
              taskId: validatedDto.taskId,
            },
          });

          if (!parentComment) {
            throw new BadRequestException(
              'Parent comment not found or does not belong to this task',
            );
          }
        }

        // Create the comment
        const comment = await tx.comment.create({
          data: {
            content: validatedDto.content,
            taskId: validatedDto.taskId,
            authorId: user.id,
            parentCommentId: validatedDto.parentCommentId || null,
            accountId: user.accountId,
          },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            parentComment: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
        });

        this.logger.log(`Comment created successfully with ID: ${comment.id}`);
        return comment;
      });

      // Validate response with Zod before returning
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error creating comment: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to create comment');
    }
  }

  async updateComment(
    commentId: string,
    dto: UpdateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    // Validate input with Zod
    const validatedDto = UpdateCommentSchema.parse(dto);

    this.logger.log(`Updating comment ${commentId} by user ${user.id}`);

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: user.id,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you do not have permission to update it',
      );
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedDto.content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        parentComment: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async getTaskComments(
    query: GetCommentsQueryDto,
    user: User,
  ): Promise<CommentResponseDto[]> {
    this.logger.log(`Fetching comments for task ${query.taskId}`);

    // First verify user has access to the task
    const task = await this.prisma.task.findFirst({
      where: {
        id: query.taskId,
        OR: [
          { assigneeId: user.id },
          { creatorId: user.id },
          { project: { members: { some: { userId: user.id } } } },
        ],
      },
    });

    if (!task) {
      throw new NotFoundException(
        `Task with ID ${query.taskId} not found or access denied`,
      );
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        taskId: query.taskId,
        parentCommentId: null,
        ...(query.includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        replies: {
          where: query.includeDeleted ? {} : { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    // Validate each comment in the response
    return comments;
  }
}
