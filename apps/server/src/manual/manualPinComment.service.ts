import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountService } from 'src/account/account.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ManualPinCommentDto } from './manual.dto';
import { Comment } from 'src/entities/comment.entity';
import { ManualService } from './manual.service';

@Injectable()
export class ManualPinCommentService {
  constructor(
    private accountService: AccountService,
    @InjectQueue('manual-queue') private manualQueue: Queue,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private manualService: ManualService,
  ) {}

  // 手动沸点评论
  async manualPinComment(authorization: string, data: ManualPinCommentDto) {
    const quantity = data.comments.length;
    this.manualService.checkQuantity(quantity);

    const taskPublisher = await this.manualService.checkPublisher(
      authorization,
      quantity,
      100,
    );

    const accounts = await this.accountService.getAccountInfo(quantity);

    const jobs = [];

    for (let index = 0; index < accounts.length; index++) {
      const job = await this.manualQueue.add(
        'pinComment',
        {
          accounts: [accounts[index]],
          url: data.url,
          comment: data.comments[index],
          taskPublisher: taskPublisher.id,
        },
        {
          delay: data.delay * index,
          priority: 1,
        },
      );
      jobs.push(job.id);
    }

    return {
      jobId: jobs,
    };
  }
}
