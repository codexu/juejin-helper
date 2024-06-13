import { Module } from '@nestjs/common';
import { ManualService } from './manual.service';
import { ManualController } from './manual.controller';
import { AccountModule } from 'src/account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountLog } from 'src/entities/accountLog.entity';
import { ManualConsumer } from 'src/common/consumers/manual.consumer';
import { BullModule } from '@nestjs/bull';
import { UserInfo } from 'src/entities/userinfo.entity';
import { Account } from 'src/entities/account.entity';
import { Comment } from 'src/entities/comment.entity';
import { ManualArticleReadService } from './manualArticleRead.service';
import { ManualArticleStarService } from './manualArticleStar.service';
import { ManualArticleCommentService } from './manualArticleComment.service';
import { ManualPinStarService } from './manualPinStar.service';
import { ManualPinCommentService } from './manualPinComment.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'manual-queue',
    }),
    AccountModule,
    TypeOrmModule.forFeature([AccountLog, UserInfo, Account, Comment]),
  ],
  providers: [
    ManualService,
    ManualConsumer,
    ManualArticleReadService,
    ManualArticleStarService,
    ManualArticleCommentService,
    ManualPinStarService,
    ManualPinCommentService,
  ],
  controllers: [ManualController],
})
export class ManualModule {}
