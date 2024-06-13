import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Keyword {
  @PrimaryGeneratedColumn()
  id: number;

  // 关键词
  @Column({ nullable: true })
  word: string;

  // 权重
  @Column({ nullable: true, default: 0 })
  weight: number;

  // 热度
  @Column({ nullable: true, default: 0 })
  hot: number;

  // 出现次数
  @Column({ nullable: true, default: 0 })
  count: number;

  // 总评论数
  @Column({ nullable: true, default: 0 })
  comment: number;

  // 总点赞数
  @Column({ nullable: true, default: 0 })
  like: number;

  // 关键词绑定多个 pin
  @Column('text')
  pinIds: string;

  // 关键词绑定多个作者authorId
  @Column('text')
  authorIds: string;

  // 是否屏蔽
  @Column({ nullable: true, default: false })
  isBlock: boolean;
}
