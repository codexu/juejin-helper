import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountService } from 'src/account/account.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ManualArticleCommentDto } from './manual.dto';
import { Comment } from 'src/entities/comment.entity';
import { ManualService } from './manual.service';

@Injectable()
export class ManualArticleCommentService {
  constructor(
    private accountService: AccountService,
    @InjectQueue('manual-queue') private manualQueue: Queue,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private manualService: ManualService,
  ) {}

  // 手动文章评论
  async manualArticleComment(
    authorization: string,
    data: ManualArticleCommentDto,
  ) {
    this.manualService.checkQuantity(data.quantity);

    const taskPublisher = await this.manualService.checkPublisher(
      authorization,
      data.quantity,
      100,
    );

    const accounts = await this.accountService.getAccountInfo(data.quantity);
    const comments = [];
    if (data.comments && data.comments.length) {
      comments.push(...data.comments);
    } else {
      const commentList = await this.commentRepository
        .createQueryBuilder('comment')
        // 如果 data.type 存在，则筛选出对应类型的评论
        .where(data.type ? 'comment.type = :type' : '1=1', {
          type: data.type,
        })
        .andWhere('comment.enable = :enable', { enable: 1 })
        .orderBy('RAND()')
        .limit(data.quantity || 1)
        .getMany();
      const onlyContent = commentList.map((item) => item.content);
      comments.push(...onlyContent);
    }

    const jobs = [];

    for (let index = 0; index < accounts.length; index++) {
      const job = await this.manualQueue.add(
        'articleComment',
        {
          accounts: [accounts[index]],
          url: data.articleUrl,
          comment: comments[index],
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
