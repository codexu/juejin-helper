import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ManualArticleListReadDto, ManualArticleReadDto } from './manual.dto';
import { ManualService } from './manual.service';

// 手动刷阅读量
@Injectable()
export class ManualArticleReadService {
  constructor(
    private accountService: AccountService,
    @InjectQueue('manual-queue') private manualQueue: Queue,
    private manualService: ManualService,
  ) {}

  // 指定一篇文章刷阅读量，每个任务刷 10 次阅读量
  async read(authorization: string, data: ManualArticleReadDto) {
    this.manualService.checkQuantity(data.quantity);

    const taskPublisher = await this.manualService.checkPublisher(
      authorization,
      data.quantity,
      1,
    );
    const ids = [];

    for (let index = 0; index < data.quantity; index++) {
      const accounts = await this.accountService.getAccountInfo(1);
      const job = await this.manualQueue.add(
        'userArticleRead',
        {
          accounts,
          url: data.url,
          taskPublisher: taskPublisher.id,
        },
        {
          delay: data.delay * index,
          priority: 1,
        },
      );
      ids.push(job.id);
    }

    return {
      jobId: ids,
    };
  }

  // 手动为用户文章列表中的每一篇文章刷阅读量
  async readList(authorization: string, data: ManualArticleListReadDto) {
    this.manualService.checkQuantity(data.quantity);

    const taskPublisher = await this.manualService.checkPublisher(
      authorization,
      data.quantity,
      1,
    );
    const accounts = await this.accountService.getAccountInfo(data.quantity);
    const job = await this.manualQueue.add('userArticleRead', {
      accounts,
      url: data.postUrl,
      quantity: data.quantity,
      taskPublisher: taskPublisher.id,
    });
    return {
      jobId: job.id,
    };
  }
}
