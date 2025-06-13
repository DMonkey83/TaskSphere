import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Project } from './../../projects/entities/project.entity';
import { Task } from './../../tasks/entities/task.entity';
import { Roadmap } from './readmap.entity';

@Entity('roadmap_items')
export class RoadmapItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Roadmap, { onDelete: 'CASCADE' })
  roadmap: Roadmap;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
