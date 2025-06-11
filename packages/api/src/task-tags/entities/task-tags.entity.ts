import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Account } from '../../accounts/entities/account.entity';

@Entity('task_tags')
@Index(['account'])
@Index(['name', 'account'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { nullable: false })
  account: Account;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  isActive: boolean;

  @Column({ nullable: true })
  color: string;

  @ManyToMany(() => Task, (task) => task.tags)
  @JoinTable()
  tasks: Task[];
}
