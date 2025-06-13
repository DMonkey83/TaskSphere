import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('onboarding_drafts')
@Index(['userId'], { unique: true })
@Index(['completed'])
export class Onboarding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.onboardingDraft, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;
}
