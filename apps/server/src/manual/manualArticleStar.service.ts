import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountService } from 'src/account/account.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Account } from 'src/entities/account.entity';
import { ManualService } from './manual.service';

@Injectable()
export class ManualArticleStarService {
  constructor(
    private accountService: AccountService,
    @InjectQueue('manual-queue') private manualQueue: Queue,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private manualService: ManualService,
  ) {}

  // 手动文章点赞
  async manualArticleStar(
    authorization: string,
    url: string,
    quantity?: number,
    delay = 0,
    priority = 1,
  ) {
    this.manualService.checkQuantity(quantity);

    const taskPublisher = await this.manualService.checkPublisher(
      authorization,
      quantity,
      50,
    );

    const accounts = await this.accountService.getAccountInfo(quantity);
    const jobIds = [];

    for (let index = 0; index < accounts.length; index++) {
      const account = accounts[index];
      const job = await this.manualQueue.add(
        'articleStar',
        {
          accounts: [account],
          url,
          taskPublisher: taskPublisher.id,
        },
        {
          delay: delay * index,
          priority,
        },
      );
      jobIds.push(job.id);
      // 为执行任务的账号增加贡献值
      account.userInfo.contribution += 10;
      await this.accountRepository.save(account);
    }
    return {
      jobId: jobIds,
    };
  }

  // 手动为用户文章列表随机点赞
  async manualUserArticleRandomStar(postUrl: string, quantity?: number) {
    const accounts = await this.accountService.getAccountInfo(quantity);
    const job = await this.manualQueue.add('userArticleRandomStar', {
      accounts,
      postUrl,
      quantity,
    });
    return {
      jobId: job.id,
    };
  }
}
