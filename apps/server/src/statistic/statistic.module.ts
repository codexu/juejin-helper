import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Statistic } from 'src/entities/statistic.entity';
import { BullModule } from '@nestjs/bull';
import { StatisicDailyService } from './statisticDaily.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserInfo, AccountLog, Statistic]),
    BullModule.registerQueue({
      name: 'manual-queue',
    }),
  ],
  providers: [StatisticService, StatisicDailyService],
  controllers: [StatisticController],
})
export class StatisticModule {}
