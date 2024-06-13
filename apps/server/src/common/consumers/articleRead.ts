import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/entities/userinfo.entity';
import browserInit from 'src/libs/browserInit';
import scrollToBottom from 'src/libs/scrollToBottom';

export interface ArticleReadJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
}

export class ArticleReadConsumer {
  constructor(
    private accountLogsRepository: Repository<AccountLog>,
    private userInfoRepository: Repository<UserInfo>,
  ) {}

  async process(job: Job<ArticleReadJobData>) {
    const { url, accounts } = job.data;
    const { page, destroy } = await browserInit();
    await page.goto(url);
    await job.progress(100);
    await scrollToBottom(page);
    await page.waitForTimeout(1000);
    destroy();
    await this.accountLogsRepository.save({
      type: '文章',
      event: '阅读',
      link: url,
      content: `阅读量：1，奖励1点贡献值。`,
      record: `阅读成功`,
      account: accounts[0].id,
    });
    await this.userInfoRepository.update(accounts[0].userInfo.id, {
      contribution: accounts[0].userInfo.contribution + 1,
    });
    console.log(accounts[0].userInfo.username, '阅读成功');
  }
}
