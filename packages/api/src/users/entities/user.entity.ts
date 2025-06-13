import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEnum } from '../../../../shared/src/enumsTypes/role.enum';
import { Account } from '../../accounts/entities/account.entity';
import { Onboarding } from '../../onboarding/entities/onboardings.entity';
import { ProjectMember } from '../../project-members/entities/project-member.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('users')
@Index(['account', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => ProjectMember, (pm) => pm.user)
  projectMemberships: ProjectMember[];

  @OneToOne(() => Onboarding, (draft) => draft.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'onboarding_draft_id' })
  onboardingDraft: Onboarding;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.Member })
  role: RoleEnum;

  @ManyToMany(() => Team, (team) => team.members)
  @JoinTable()
  teams: Team[];

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', nullable: true })
  mfaSecret: string;

  @Column({ name: 'onboarding_step', type: 'int', default: 0 })
  onboardingStep: number;

  @Column({ name: 'has_completed_onboarding', default: false })
  hasCompletedOnboarding: boolean;

  @Column({ name: 'first_login_at', type: 'timestamptz', nullable: true })
  firstLoginAt: Date | null;

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
