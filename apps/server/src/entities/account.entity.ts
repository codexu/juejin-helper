import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserInfo } from './userinfo.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  account: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, length: '4096' })
  cookie: string;

  @Column({ default: 'user' })
  type: string;

  @Column({ nullable: true })
  mainAccount: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate: Date;

  @OneToOne(() => UserInfo, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userInfo: UserInfo;
}
