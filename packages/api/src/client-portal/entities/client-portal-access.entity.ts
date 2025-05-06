import { Project } from './../../projects/entities/project.entity';
import { Customer } from './../../customers/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('client_portal_access')
export class ClientPortalAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  customer: Customer;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ unique: true })
  accessToken: string;

  @Column({ default: 'viewer' })
  role: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
