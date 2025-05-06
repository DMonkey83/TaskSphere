import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AddProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['owner', 'project_manager', 'member']),
});

export const RemoverProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export class AddProjectMemberDto extends createZodDto(AddProjectMemberSchema) {}
export class RemoveProjectMemberDto extends createZodDto(
  RemoverProjectMemberSchema,
) {}
