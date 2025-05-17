import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.activities)
  task: Task;

  @ManyToOne(() => User)
  user: User;

  @Column()
  action: string;

  @Column({ nullable: true })
  field: string;

  @Column({ nullable: true })
  oldValue: string;

  @Column({ nullable: true })
  newValue: string;

  @CreateDateColumn({
    name: 'crated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  cratedAt: Date;
}
