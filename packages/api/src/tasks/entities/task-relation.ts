import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class TaskRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task)
  task: Task;

  @ManyToOne(() => Task)
  relatedTask: Task;

  @Column({ enum: ['cloned_from', 'blocked_by', 'blocking'] })
  relationType: string;
}
