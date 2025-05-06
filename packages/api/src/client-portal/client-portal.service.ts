import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ClientPortalAccess } from './entities/client-portal-access.entity';
import { Repository } from 'typeorm';
import { GrantAccessDtoClass } from './dto/client-portal.dto';

@Injectable()
export class ClientPortalService {
  constructor(
    @InjectRepository(ClientPortalAccess)
    private clientPortalAccessRepository: Repository<ClientPortalAccess>,
  ) {}

  async grantAccess(dto: GrantAccessDtoClass): Promise<ClientPortalAccess> {
    const accessToken = uuidv4();
    const access = this.clientPortalAccessRepository.create({
      customer: { id: dto.customerId },
      project: { id: dto.projectId },
      accessToken,
      role: dto.role || 'viewer',
    });
    return this.clientPortalAccessRepository.save(access);
  }

  async getAccessibleProject(accessToken: string): Promise<ClientPortalAccess> {
    const access = await this.clientPortalAccessRepository.findOne({
      where: { accessToken },
      relations: ['project'],
    });
    if (!access) throw new NotFoundException('Invalid access token');
    return access;
  }
}
