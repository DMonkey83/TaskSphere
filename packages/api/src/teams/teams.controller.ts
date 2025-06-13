import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TeamsService } from './teams.service';
import { GetUser } from '../auth/get-user.decorator';
import { RoleGuard } from '../auth/role.guard';
import { TeamDto } from './dto/team.dto';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('account/:accountId')
  async getTeamsByAccount(
    @Param('accountId') accountId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @GetUser() user: User,
  ): Promise<Team[]> {
    console.log('Fetching teams for account.id:', accountId, 'User:', user);
    if (user.account.id !== accountId) {
      throw new ForbiddenException('Access denied to this account');
    }
    const teams = await this.teamsService.listTeamsByAccount(accountId, user);
    return teams.slice(skip, skip + take);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getTeamDetails(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Team> {
    return this.teamsService.getTeamDetails(id, user.account.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async createTeam(@Body() dto: TeamDto, @GetUser() user: User): Promise<Team> {
    return this.teamsService.createTeam(dto, user);
  }
}
