import { ProjectView } from './../projects/entities/project-view.entity';
import { Project } from './../projects/entities/project.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectView)
    private projectViewsRepository: Repository<ProjectView>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async addMember(data: {
    userId: string;
    projectId: string;
    role: 'owner' | 'project_manager' | 'member';
  }) {
    const member = this.projectMemberRepository.create({
      user: { id: data.userId },
      project: { id: data.projectId },
      role: data.role,
    });
    return this.projectMemberRepository.save(member);
  }

  async getUserRoleInProject(
    userId: string,
    projectId: string,
  ): Promise<string | null> {
    const member = await this.projectMemberRepository.findOne({
      where: {
        user: { id: userId },
        project: { id: projectId },
      },
    });

    return member?.role ?? null;
  }

  async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: { project: { id: projectId } },
    });
  }

  async removeMember(userId: string, projectId: string): Promise<void> {
    const member = await this.projectMemberRepository.findOne({
      where: {
        user: { id: userId },
        project: { id: projectId },
      },
    });

    if (!member) throw new NotFoundException('Member not found');
    await this.projectMemberRepository.remove(member);
  }
}
