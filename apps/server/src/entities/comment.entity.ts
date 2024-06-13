import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  // 评论内容
  @Column()
  content: string;

  @Column({ default: 0 })
  userId: string;

  // 是否启用
  @Column({ default: false })
  enable: boolean;

  // 评论类型 好评、废话、差评、爬虫
  @Column({ default: '好评' })
  type: string;

  // 使用次数
  @Column({ default: 0 })
  useCount: number;

  // 类型 文章、沸点
  @Column({ default: '文章' })
  useType: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
