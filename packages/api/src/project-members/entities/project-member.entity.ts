import { Project } from './../../projects/entities/project.entity';
import { User } from './../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.projectMemberships, { eager: true })
  user: User;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @Column()
  role: 'owner' | 'project_manager' | 'member';
}
