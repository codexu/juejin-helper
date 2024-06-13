import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { AutomateModule } from 'src/automate/automate.module';
import { TaskController } from './task.controller';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
@Module({
  providers: [TaskService],
  imports: [
    BullModule.registerQueue({
      name: 'manual-queue',
    }),
    AutomateModule,
    TypeOrmModule.forFeature([Account, UserInfo]),
  ],
  controllers: [TaskController],
})
export class TaskModule {}
