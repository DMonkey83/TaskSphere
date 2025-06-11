import { RoleEnum } from '../../../../shared/src/enumsTypes/role.enum';
import { Account } from './../../accounts/entities/account.entity';
import { InviteStatusEnum } from '../../common/enums/invite-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('account_invites')
@Index(['email', 'account'])
@Index(['token'])
@Index(['expiresAt'])
export class AccountInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'enum', enum: RoleEnum })
  role: RoleEnum;

  @Column({
    type: 'enum',
    enum: InviteStatusEnum,
    default: InviteStatusEnum.Pending,
  })
  status: InviteStatusEnum;

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
