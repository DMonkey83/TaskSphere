import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientPortalAccess } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'src/prisma/prisma.service';

import { GrantAccessDtoClass } from './dto/client-portal.dto';

@Injectable()
export class ClientPortalService {
  constructor(private prisma: PrismaService) {}

  async grantAccess(dto: GrantAccessDtoClass): Promise<ClientPortalAccess> {
    const accessToken = uuidv4();

    const access = this.prisma.clientPortalAccess.create({
      data: {
        customerId: dto.customerId,
        projectId: dto.projectId,
        accessToken,
        role: dto.role || 'viewer',
      },
    });
    return access;
  }

  async getAccessibleProject(accessToken: string): Promise<ClientPortalAccess> {
    const access = await this.prisma.clientPortalAccess.findUnique({
      where: { accessToken },
      include: { project: true },
    });
    if (!access) throw new NotFoundException('Invalid access token');
    return access;
  }
}
