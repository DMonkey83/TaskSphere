import { Role } from '../../common/enums/role.enum';
import { Account } from '../../accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectMember } from '../../project-members/entities/project-member.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Account)
  account: Account;

  @ManyToMany(() => ProjectMember, (pm) => pm.user)
  projectMemberships: ProjectMember[];

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: string;

  @ManyToMany(() => Team, (team) => team.members)
  @JoinTable()
  teams: Team[];

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', default: false })
  mfaSecret: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
