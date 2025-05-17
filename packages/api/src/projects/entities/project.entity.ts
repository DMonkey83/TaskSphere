import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectMember } from '../../project-members/entities/project-member.entity';
import { Account } from './../../accounts/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

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

  @Column({ nullable: true })
  industry: string;

  @ManyToOne(() => Team, (teams) => teams.members)
  teams: Team[];

  @Column()
  planningType: string;

  @Column({ default: 'planned' })
  status: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  matterNumber: string;

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
