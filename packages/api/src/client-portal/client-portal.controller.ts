import { Body, Controller, Get, Param, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientPortalAccess } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { RoleGuard } from './../auth/role.guard';
import { Roles } from './../auth/roles.decorator';
import { ClientPortalService } from './client-portal.service';
import { GrantAccessDtoClass } from './dto/client-portal.dto';

@Controller('client-portals')
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'project_manager')
  @Post('grant')
  async grantAccess(
    @Body(new ZodValidationPipe(GrantAccessDtoClass)) body: GrantAccessDtoClass,
  ): Promise<ClientPortalAccess> {
    const access: ClientPortalAccess =
      await this.clientPortalService.grantAccess(body);
    return access;
  }

  @Get('access/:accessToken')
  async getAccessibleProject(
    @Param('accessToken') accessToken: string,
  ): Promise<ClientPortalAccess> {
    const access: ClientPortalAccess =
      await this.clientPortalService.getAccessibleProject(accessToken);
    return access;
  }
}
