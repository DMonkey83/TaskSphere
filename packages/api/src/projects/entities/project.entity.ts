import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IndustriesEnum } from '../../../../shared/src/enumsTypes/industries.enum';
import { WorkflowEnum } from '../../../../shared/src/enumsTypes/workflow.enum';
import { ProjectMember } from '../../project-members/entities/project-member.entity';
import { Account } from './../../accounts/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

@Unique(['account', 'projectKey'])
@Unique(['account', 'slug'])
@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectKey: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Account)
  account: Account;

  @ManyToOne(() => User)
  owner: User;

  @ManyToMany(() => ProjectMember, (pm) => pm.project)
  members: ProjectMember[];

  @Column({ type: 'enum', enum: IndustriesEnum, nullable: true })
  industry: IndustriesEnum;

  @ManyToMany(() => Team, (teams) => teams.projects)
  @JoinTable()
  teams: Team[];

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ type: 'enum', enum: WorkflowEnum, default: WorkflowEnum.Kanban })
  workflow: WorkflowEnum;

  @Column({ default: 'planned' })
  status: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  matterNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ default: false })
  archived: boolean;

  @Column({ type: 'varchar', nullable: true })
  visibility: 'private' | 'team' | 'account';

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
