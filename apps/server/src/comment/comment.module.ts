import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { AccountModule } from 'src/account/account.module';
import { Account } from 'src/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Account]), AccountModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
