import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Team } from './entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { TeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async createTeam(dto: TeamDto, user: User): Promise<Team> {
    if (!['admin', 'project_manager', 'owner'].includes(user.role)) {
      throw new Error('You do not have permission to create a team');
    }
    const project = dto.projectId
      ? await this.projectRepository.findOneByOrFail({
          id: dto.projectId,
        })
      : null;

    const team = this.teamRepository.create({
      name: dto.name,
      description: dto.description,
      project: project ? project : null,
      account: user.account,
    });
    if (dto.memberIds) {
      team.members = await this.userRepository.findBy({
        id: In(dto.memberIds),
      });
    }
    return this.teamRepository.save(team);
  }
  async addTeamMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamRepository.findOneOrFail({
      where: { id: teamId },
      relations: ['members'],
    });
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    team.members.push(user);
    return this.teamRepository.save(team);
  }

  async listTeamsByAccount(accountId: string, user: User): Promise<Team[]> {
    if (['admin', 'project_manager', 'owner'].includes(user.role)) {
      return this.teamRepository.find({
        where: { account: { id: accountId } },
        relations: ['project', 'members', 'account'],
      });
    } else {
      return this.teamRepository.find({
        where: { members: { id: user.id, account: { id: accountId } } },
        relations: ['project', 'members', 'account'],
      });
    }
  }

  async getTeamDetails(id: string, accountId: string): Promise<Team> {
    const team = await this.teamRepository.findOneOrFail({
      where: { id, account: { id: accountId } },
      relations: ['project', 'members'],
    });
    return team;
  }
}
