import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import gotoWithRetries from 'src/libs/gotoWithRetries';
import articleStar from 'src/libs/pageControl/articleStar';
import checkLoginState from 'src/libs/pageControl/checkLoginState';
import loopPages from 'src/libs/pageControl/loopPages';
import { Repository } from 'typeorm';

export interface ArticleStarJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
}

export class ArticleStarConsumer {
  constructor(private accountLogsRepository: Repository<AccountLog>) {}

  async process(job: Job<ArticleStarJobData>) {
    const { url, accounts } = job.data;
    let progress = 0;

    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, url);
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const data = await articleStar(page);
      if (!data) return;
      const { isStar, isCollection, title } = data;
      if (isStar && isCollection) {
        await this.accountLogsRepository.save({
          type: '文章',
          event: '点赞',
          link: url,
          content: title,
          record: '重复点赞， 跳过',
          account: accounts[index].id,
        });
      } else {
        await this.accountLogsRepository.save({
          type: '文章',
          event: '点赞',
          link: url,
          record: '点赞成功',
          content: title,
          account: accounts[index].id,
        });
      }
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
