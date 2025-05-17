import {z} from 'zod'

export const CreateTimeTrackingSchema = z.object({
    taskId: z.string().uuid(),
    hours: z.number(),
    description: z.string().optional(),
    workDate: z.date()
})