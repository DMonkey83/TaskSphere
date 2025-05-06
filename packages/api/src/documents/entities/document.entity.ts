import { User } from './../../users/entities/user.entity';
import { Task } from './../../tasks/entities/task.entity';
import { Project } from './../../projects/entities/project.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'SET NULL' })
  task: Task;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @ManyToOne(() => User, { nullable: true })
  uploadedBy: User;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
