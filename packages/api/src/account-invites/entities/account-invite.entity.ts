import { Account } from './../../accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccountInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ nullable: true })
  role: string;

  @Column({ unique: true })
  token: string;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
