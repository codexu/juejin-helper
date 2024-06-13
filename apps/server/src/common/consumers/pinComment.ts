import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import checkLoginState from 'src/libs/pageControl/checkLoginState';
import loopPages from 'src/libs/pageControl/loopPages';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/entities/userinfo.entity';

export interface PinCommentJobData {
  url: string;
  accounts: Account[];
  comment: string;
}

export class PinCommentConsumer {
  constructor(
    private accountLogsRepository: Repository<AccountLog>,
    private userInfoRepository: Repository<UserInfo>,
  ) {}

  async process(job: Job<PinCommentJobData>) {
    const { url, accounts, comment } = job.data;
    let progress = 0;
    await loopPages(accounts, async (page, index) => {
      await page.goto(url);
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const content = await page.$eval('.content', (el) =>
        el.textContent.trim().slice(0, 30),
      );
      await page.waitForSelector('.rich-input');
      await page.type('.rich-input', comment);
      await page.waitForSelector('.submit .submit-btn');
      await page.waitForTimeout(1000);
      await page.click('.submit .submit-btn');
      await page.waitForTimeout(1000);
      this.accountLogsRepository.save({
        type: '沸点',
        event: '评论',
        link: url,
        content,
        record: comment,
        account: accounts[index].id,
      });
      await this.userInfoRepository.update(accounts[index].userInfo.id, {
        contribution: accounts[index].userInfo.contribution + 20,
      });
      await page.waitForTimeout(1000);
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
