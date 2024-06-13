import { Account } from './account.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class AccountLog {
  @PrimaryGeneratedColumn()
  id: number;

  // 类别：文章、沸点等
  @Column()
  type: string;

  // 操作类型：点赞、评论等
  @Column()
  event: string;

  // 链接
  @Column({ nullable: true })
  link: string;

  // 内容
  @Column({ nullable: true })
  content: string;

  // 记录
  @Column({ nullable: true })
  record: string;

  // 是否已读
  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Account, (account) => account.account, { cascade: true })
  @JoinColumn()
  account: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
