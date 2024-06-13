import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AccountService } from './account.service';
import { ManualService } from 'src/manual/manual.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CheckService {
  constructor(
    @InjectQueue('manual-queue') private manualQueue: Queue,
    private readonly accountService: AccountService,
    private readonly manualService: ManualService,
  ) {}

  // 检测 cookie 是否过期
  @Cron('0 0 3 * * *', { name: 'checkCookie', timeZone: 'Asia/Shanghai' })
  async checkCookie(authorization?: string) {
    let taskPublisher = null;
    if (authorization) {
      taskPublisher = await this.manualService.checkPublisher(
        authorization,
        1,
        0,
      );
    }
    const accounts = await this.accountService.getAccountInfo();
    await this.manualQueue.add('checkCookie', {
      accounts,
      taskPublisher: taskPublisher ? taskPublisher.id : 1,
    });
  }
}
