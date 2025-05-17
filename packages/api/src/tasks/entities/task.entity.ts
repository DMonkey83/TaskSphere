import { Attachment } from '../../attachments/entities/attachments.entity';
import { Comment } from '../../comments/entities/comments.entity';
import { Project } from '../../projects/entities/project.entity';
import { Tag } from '../../task-tags/entities/task-tags.entity';
import { TaskActivity } from '../../TaskActivities/entities/task-activities.entity';
import { Team } from '../../teams/entities/team.entity';
import { TimeTracking } from '../../time-trackings/entities/time-tracking.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => User, { nullable: true })
  creator: User;

  @ManyToOne(() => Task, (task) => task.children, { nullable: true })
  team: Team;

  @Column({
    enum: ['epic', 'bug', 'feature', 'story', 'subtask'],
    default: 'subtask',
  })
  type: string;

  @ManyToOne(() => Task, (task) => task.children, { nullable: true })
  parent: Task;

  @OneToMany(() => Task, (task) => task.parent)
  children: Task[];

  @ManyToMany(() => Task)
  @JoinTable({
    name: 'task_relations',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'relatedTaskId', referencedColumnName: 'id' },
  })
  relatedTasks: Task[];

  @Column({ default: 'todo' })
  status: string;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];

  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => TaskActivity, (activity) => activity.task)
  activities: TaskActivity[];

  @OneToMany(() => TimeTracking, (timeTracking) => timeTracking.task)
  timeTrackings: TimeTracking[];

  @Column({ enum: ['low', 'medium', 'high'], default: 'medium' })
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
