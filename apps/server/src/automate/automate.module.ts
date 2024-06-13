import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutomateController } from './automate.controller';
import { AutomateService } from './automate.service';

import { AccountModule } from 'src/account/account.module';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { Comment } from 'src/entities/comment.entity';
import { Pin } from 'src/entities/pin.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    AccountModule,
    HttpModule,
    TypeOrmModule.forFeature([AccountLog, Account, UserInfo, Comment, Pin]),
  ],
  controllers: [AutomateController],
  providers: [AutomateService],
  exports: [AutomateService],
})
export class AutomateModule {}
