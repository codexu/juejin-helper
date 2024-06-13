import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Statistic {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户总数（只要登录过的都记录）
  @Column({ default: 0 })
  userCount: number;

  // 可用用户数（cookie 存在的数量）
  @Column({ default: 0 })
  enableUserCount: number;

  // 每日文章点赞数
  @Column({ default: 0 })
  articleLikeCount: number;

  // 每日文章评论数
  @Column({ default: 0 })
  articleCommentCount: number;

  // 每日沸点点赞数
  @Column({ default: 0 })
  pinLikeCount: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
