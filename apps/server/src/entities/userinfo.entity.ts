import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserInfo {
  @PrimaryGeneratedColumn()
  id: number;

  // 可选参数
  @Column({ default: '未获取' })
  username: string;

  // 用户ID
  @Column({ default: '未获取' })
  userId: string;

  // 头像
  @Column({ default: '未获取' })
  avatar: string;

  // 贡献值
  @Column({ default: 0 })
  contribution: number;

  // 未读消息
  @Column({ default: 0 })
  unreadMessage: number;

  // 连续签到天数
  @Column({ default: 0 })
  consecutiveDays: number;

  // 总签到天数
  @Column({ default: 0 })
  totalDays: number;

  // 总矿石数
  @Column({ default: 0 })
  totalMoney: number;

  // 对别人的文章点赞数
  @Column({ default: 0 })
  userArticleLike: number;

  // 对别人的沸点点赞数
  @Column({ default: 0 })
  userPinLike: number;

  // 总文章数
  @Column({ default: 0 })
  totalArticle: number;

  // 总展现数
  @Column({ default: 0 })
  articleShow: number;

  // 总阅读数
  @Column({ default: 0 })
  articleRead: number;

  // 总点赞数
  @Column({ default: 0 })
  articleLike: number;

  // 总评论数
  @Column({ default: 0 })
  articleComment: number;

  // 总收藏数
  @Column({ default: 0 })
  articleCollect: number;

  // 总沸点数
  @Column({ default: 0 })
  totalPin: number;

  // 总沸点点赞数
  @Column({ default: 0 })
  totalPinLike: number;

  // 总沸点评论数
  @Column({ default: 0 })
  totalPinComment: number;

  // 最后更新时间
  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdated: Date;
}
