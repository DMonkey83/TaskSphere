import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  title: string;

  @Column({ unique: true })
  taskKey: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: true })
  asignee: User;

  @Column({ default: 'todo' })
  status: string;

  @Column({ default: 'medium' })
  priority: string;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  storyPoints: number;

  @Column({ nullable: true })
  billableHours: number;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ type: 'tstzrange', nullable: true })
  deliveryWindow: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
