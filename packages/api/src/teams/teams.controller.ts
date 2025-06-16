import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TeamsService } from './teams.service';
import { UserPayload } from '../auth/dto/auth.dto';
import { GetUser } from '../auth/get-user.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateTeamDto,
  TeamResponseDto,
  AddTeamMemberDto,
  UpdateTeamDto,
} from './dto/team.dto';

@Controller('teams')
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly teamsService: TeamsService) {}

  // ===================== TEAM MANAGEMENT =====================

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin', 'owner')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTeam(
    @Body() dto: CreateTeamDto,
    @GetUser() user: UserPayload,
  ): Promise<TeamResponseDto> {
    this.logger.log(
      `Creating team: ${dto.name} for account: ${user.account.id}`,
    );
    return await this.teamsService.createTeam(dto, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTeamsByAccount(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number = 0,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number = 20,
    @GetUser() user: UserPayload,
  ): Promise<TeamResponseDto[]> {
    this.logger.log(
      `Fetching teams for account: ${user.account.id}, ${skip} skipped, ${take} taken`,
    );
    return this.teamsService.listTeamsByAccount(user.account.id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getTeamDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ): Promise<TeamResponseDto> {
    this.logger.log(`Fetching team details: ${id}`);
    return this.teamsService.getTeamDetails(id, user);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin', 'owner')
  @Patch(':id')
  async updateTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
    @GetUser() user: UserPayload,
  ): Promise<TeamResponseDto> {
    this.logger.log(`Updating team: ${id}`);
    return this.teamsService.updateTeam(id, dto, user);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'admin', 'owner')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ): Promise<void> {
    this.logger.log(`Deleting team: ${id}`);
    return this.teamsService.deleteTeam(id, user);
  }

  // ===================== TEAM MEMBER MANAGEMENT =====================

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('project_manager', 'team_lead', 'admin', 'owner')
  @Post(':id/members')
  async addTeamMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Body() dto: AddTeamMemberDto,
    @GetUser() user: UserPayload,
  ): Promise<TeamResponseDto> {
    this.logger.log(`Adding member to team: ${teamId}`);
    return this.teamsService.addTeamMember({ ...dto, teamId }, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTeamMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @GetUser() user: UserPayload,
  ): Promise<void> {
    this.logger.log(`Removing member ${userId} from team: ${teamId}`);
    await this.teamsService.removeTeamMember(teamId, userId, user);
  }
}
