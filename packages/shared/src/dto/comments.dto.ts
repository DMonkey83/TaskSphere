import { z } from "zod";

// Create Comment DTO
export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content too long"),
  taskId: z.string().uuid("Invalid task ID"),
  parentCommentId: z.string().uuid("Invalid parent comment ID").optional(),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

// Update Comment DTO
export const UpdateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content too long"),
});

export type UpdateCommentDto = z.infer<typeof UpdateCommentSchema>;

// Comment Response DTO
export const CommentAuthorSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const CommentResponseSchema = z.lazy(() =>
  z.object({
    id: z.string(),
    content: z.string(),
    taskId: z.string(),
    authorId: z.string(),
    parentCommentId: z.string().nullable(),
    accountId: z.string(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    author: CommentAuthorSchema,
    parentComment: CommentResponseSchema.omit({
      replies: true,
      parentComment: true,
    })
      .nullable()
      .optional(),
    replies: z.array(CommentResponseSchema).optional(),
    _count: z
      .object({
        replies: z.number(),
      })
      .optional(),
  })
);

export type CommentResponseDto = {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  parentCommentId: string | null;
  accountId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: z.infer<typeof CommentAuthorSchema>;
  parentComment?: Omit<CommentResponseDto, "replies" | "parentComment"> | null;
  replies?: CommentResponseDto[];
  _count?: {
    replies: number;
  };
};

// Query Parameters DTO
export const GetCommentsQuerySchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  includeDeleted: z.coerce.boolean().default(false),
});

export type GetCommentsQueryDto = z.infer<typeof GetCommentsQuerySchema>;
