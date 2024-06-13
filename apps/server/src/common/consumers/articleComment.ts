import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import checkLoginState from 'src/libs/pageControl/checkLoginState';
import loopPages from 'src/libs/pageControl/loopPages';
import { Repository } from 'typeorm';
import publishArticleComment from 'src/libs/pageControl/publishArticleComment';
import fetchArticleTitle from 'src/libs/pageControl/fetchArticleTitle';
import { UserInfo } from 'src/entities/userinfo.entity';

export interface ArticleCommentJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
  comment?: string;
}

export class ArticleCommentConsumer {
  constructor(
    private accountLogsRepository: Repository<AccountLog>,
    private userInfoRepository: Repository<UserInfo>,
  ) {}

  async process(job: Job<ArticleCommentJobData>) {
    const { url, accounts, comment } = job.data;
    let progress = 0;
    await loopPages(accounts, async (page, index) => {
      await page.goto(url);
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const title = await fetchArticleTitle(page);
      const isPublish = await publishArticleComment(page, comment);
      if (!isPublish) return;
      this.accountLogsRepository.save({
        type: '文章',
        event: '评论',
        link: url,
        content: title,
        record: comment,
        account: accounts[index].id,
      });
      await this.userInfoRepository.update(accounts[index].userInfo.id, {
        contribution: accounts[index].userInfo.contribution + 20,
      });
      await page.waitForTimeout(500);
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
