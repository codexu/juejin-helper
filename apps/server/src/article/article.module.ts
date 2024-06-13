import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleReserve } from 'src/entities/articleReserve.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

// 沸点分析模块
@Module({
  imports: [TypeOrmModule.forFeature([ArticleReserve])],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
