import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/entities/userinfo.entity';
import { ArticleStarConsumer, ArticleStarJobData } from './articleStar';
import {
  ArticleCommentConsumer,
  ArticleCommentJobData,
} from './articleComment';
import { ArticleReadConsumer, ArticleReadJobData } from './articleRead';
import { CheckCookieConsumer, CheckCookieJobData } from './checkCookie';
import { Account } from 'src/entities/account.entity';
import {
  QueryAccountInformationConsumer,
  QueryAccountInformationJobData,
} from './queryAccountInformation';
import { PinStarConsumer, PinStarJobData } from 'src/common/consumers/pinStar';
import { PinCommentConsumer, PinCommentJobData } from './pinComment';

@Processor('manual-queue')
export class ManualConsumer {
  constructor(
    @InjectRepository(AccountLog)
    private accountLogsRepository: Repository<AccountLog>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  // 文章点赞任务
  @Process('articleStar')
  async articleStar(job: Job<ArticleStarJobData>) {
    const consumer = new ArticleStarConsumer(this.accountLogsRepository);
    await consumer.process(job);
  }

  // 文章评论任务
  @Process('articleComment')
  async articleComment(job: Job<ArticleCommentJobData>) {
    const consumer = new ArticleCommentConsumer(
      this.accountLogsRepository,
      this.userInfoRepository,
    );
    await consumer.process(job);
  }

  // 文章阅读任务
  @Process('userArticleRead')
  async articleRead(job: Job<ArticleReadJobData>) {
    const consumer = new ArticleReadConsumer(
      this.accountLogsRepository,
      this.userInfoRepository,
    );
    await consumer.process(job);
  }

  // 沸点点赞任务
  @Process('pinStar')
  async pinStar(job: Job<PinStarJobData>) {
    const consumer = new PinStarConsumer(this.accountLogsRepository);
    await consumer.process(job);
  }

  // 沸点评论任务
  @Process('pinComment')
  async pinComment(job: Job<PinCommentJobData>) {
    const consumer = new PinCommentConsumer(
      this.accountLogsRepository,
      this.userInfoRepository,
    );
    await consumer.process(job);
  }

  // 检测 cookie 任务
  @Process('checkCookie')
  async checkCookie(job: Job<CheckCookieJobData>) {
    const consumer = new CheckCookieConsumer(
      this.accountRepository,
      this.accountLogsRepository,
    );
    await consumer.process(job);
  }

  // 更新账号信息任务
  @Process('queryAccountInformation')
  async queryAccountInformation(job: Job<QueryAccountInformationJobData>) {
    const consumer = new QueryAccountInformationConsumer(
      this.userInfoRepository,
      this.accountLogsRepository,
    );
    await consumer.process(job);
  }
}
