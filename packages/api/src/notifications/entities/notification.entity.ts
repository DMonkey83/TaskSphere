import { Task } from './../../tasks/entities/task.entity';
import { Customer } from './../../customers/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  customer: Customer;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @Column()
  type: string;

  @Column()
  content: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
