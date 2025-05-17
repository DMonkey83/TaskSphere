import {z} from 'zod'

export const CreateTaskActivitySchema = z.object({
    taskId: z.string().uuid(),
    userId: z.string().uuid(),
    field: z.string().optional(),
    action: z.string(),
    oldValue: z.string().optional(),
    newValue: z.string().optional()
})