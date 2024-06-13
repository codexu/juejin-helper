import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// 文章储备库
@Entity()
export class ArticleReserve {
  @PrimaryGeneratedColumn()
  id: number;

  // segmentfault 文章 id
  @Column({ nullable: true })
  articleId: string;

  // 文章标题
  @Column({ nullable: true })
  title: string;

  // 储存文章内容的 html 字符串
  @Column('text', { nullable: true })
  content: string;

  // 是否通过审核
  @Column({ default: false })
  isPass: boolean;

  // 是否发布
  @Column({ default: false })
  isPublish: boolean;

  // 创建时间
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  // 更新时间
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateTime: Date;
}
