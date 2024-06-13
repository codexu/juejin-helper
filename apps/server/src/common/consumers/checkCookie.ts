import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { setCookie } from 'src/libs/cookie';
import checkLoginState from 'src/libs/pageControl/checkLoginState';
import loopPages from 'src/libs/pageControl/loopPages';
import { Repository } from 'typeorm';

export interface CheckCookieJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
}

export class CheckCookieConsumer {
  constructor(
    private readonly accountRepository: Repository<Account>,
    private readonly accountLogsRepository: Repository<AccountLog>,
  ) {}

  async process(job: Job<CheckCookieJobData>) {
    const { accounts } = job.data;
    let progress = 0;

    await loopPages(accounts, async (page, index) => {
      await setCookie(page, accounts[index].cookie);
      await page.goto('https://juejin.cn/');
      const { state } = await checkLoginState(page, 20000);
      const { username, userId } = accounts[index].userInfo;

      if (!state) {
        await this.accountRepository.update(
          { id: accounts[index].id },
          { cookie: '' },
        );
        await this.accountLogsRepository.save({
          account: accounts[index].id,
          type: '系统',
          event: '检测登录凭证状态',
          link: `https://juejin.cn/user/${userId}`,
          content: `检测 ${username}(${userId}) 异常`,
          record: '登录凭证过期',
        });
      } else {
        await this.accountLogsRepository.save({
          account: accounts[index].id,
          type: '系统',
          event: '检测登录凭证状态',
          link: `https://juejin.cn/user/${userId}`,
          content: `检测 ${username}(${userId}) 凭证成功`,
          record: '登录凭证有效',
        });
      }
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
