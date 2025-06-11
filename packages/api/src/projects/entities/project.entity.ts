import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IndustriesEnum } from '../../../../shared/src/enumsTypes/industries.enum';
import { WorkflowEnum } from '../../../../shared/src/enumsTypes/workflow.enum';
import { ProjectStatusEnum } from '../../../../shared/src/enumsTypes';
import { ProjectMember } from '../../project-members/entities/project-member.entity';
import { Account } from './../../accounts/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import { Task } from '../../tasks/entities/task.entity';

@Unique(['account', 'projectKey'])
@Unique(['account', 'slug'])
@Entity('project')
@Index(['account', 'status'])
@Index(['owner'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  projectKey: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Account)
  account: Account;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => ProjectMember, (pm) => pm.project)
  members: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @Column({ type: 'enum', enum: IndustriesEnum, nullable: true })
  industry: IndustriesEnum;

  @ManyToMany(() => Team, (teams) => teams.projects)
  @JoinTable()
  teams: Team[];

  @Column({ unique: true, nullable: true })
  @Index()
  slug: string;

  @Column({ type: 'enum', enum: WorkflowEnum, default: WorkflowEnum.Kanban })
  workflow: WorkflowEnum;

  @Column({
    type: 'enum',
    enum: ProjectStatusEnum,
    default: ProjectStatusEnum.Planned,
  })
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
  @Index()
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
