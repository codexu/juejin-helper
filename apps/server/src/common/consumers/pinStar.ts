import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import gotoWithRetries from 'src/libs/gotoWithRetries';
import checkLoginState from 'src/libs/pageControl/checkLoginState';
import loopPages from 'src/libs/pageControl/loopPages';
import pinStar from 'src/libs/pageControl/pinStar';
import { Repository } from 'typeorm';

export interface PinStarJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
}

export class PinStarConsumer {
  constructor(private accountLogsRepository: Repository<AccountLog>) {}

  async process(job: Job<PinStarJobData>) {
    const { url, accounts } = job.data;
    let progress = 0;

    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, url);
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const data = await pinStar(page);
      if (!data) return;
      const { isStar, content } = data;
      if (isStar) {
        await this.accountLogsRepository.save({
          type: '沸点',
          event: '点赞',
          link: url,
          content,
          record: '重复点赞， 跳过',
          account: accounts[index].id,
        });
      } else {
        await this.accountLogsRepository.save({
          type: '沸点',
          event: '点赞',
          link: url,
          record: '点赞成功',
          content,
          account: accounts[index].id,
        });
      }
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
