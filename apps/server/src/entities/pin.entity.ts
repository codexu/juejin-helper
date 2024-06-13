import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pin {
  @PrimaryGeneratedColumn()
  id: number;

  // 沸点id
  @Column({ nullable: true })
  pinId: string;

  // 作者
  @Column({ nullable: true })
  authorId: string;

  // 内容
  @Column({ nullable: true })
  content: string;

  // 分组
  @Column({ nullable: true })
  club: string;

  // 评论数
  @Column({ nullable: true })
  comment: number;

  // 点赞数
  @Column({ nullable: true })
  like: number;

  // 是否为模板
  @Column({ default: false })
  isTemplate: boolean;

  // AI 是否审核
  @Column({ default: false })
  aiReview: boolean;

  // AI 审核结果
  @Column({ default: false })
  aiReviewResult: boolean;
}
