import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_status_logs')
export class TaskStatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @Column()
  status: string;

  @Column({ type: 'point', nullable: true })
  location: string;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
