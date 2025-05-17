import {z} from 'zod'

export const CreateTaskTagSchema = z.object({
    name: z.string().optional(),
    color: z.string().optional(),
})