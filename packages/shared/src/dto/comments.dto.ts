import {z} from 'zod';

export const CreateCommentSchema = z.object({
    content: z.string(),
    taskId: z.string().uuid(),
    authorId: z.string().uuid(),
    parentCommentId: z.string().uuid().optional(),
})