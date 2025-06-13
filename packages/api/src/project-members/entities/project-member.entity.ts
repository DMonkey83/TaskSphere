import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Project } from './../../projects/entities/project.entity';
import { User } from './../../users/entities/user.entity';
import { RoleEnum } from '../../../../shared/src/enumsTypes/role.enum';

@Entity('project_members')
@Unique(['user', 'project'])
@Index(['project'])
@Index(['user'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.projectMemberships, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.Member })
  role: RoleEnum;

  @CreateDateColumn({
    name: 'joined_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;
}
