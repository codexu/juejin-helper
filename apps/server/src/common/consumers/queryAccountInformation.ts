import { Job } from 'bull';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { setCookie } from 'src/libs/cookie';
import fetchUserInfo from 'src/libs/pageControl/fetchUserInfo';
import loopPages from 'src/libs/pageControl/loopPages';
import { Repository } from 'typeorm';

export interface QueryAccountInformationJobData {
  url?: string;
  quantity?: number;
  accounts: Account[];
}

export class QueryAccountInformationConsumer {
  constructor(
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly accountLogsRepository: Repository<AccountLog>,
  ) {}

  async process(job: Job<QueryAccountInformationJobData>) {
    const { accounts } = job.data;
    let progress = 0;

    await loopPages(accounts, async (page, index) => {
      await setCookie(page, accounts[index].cookie);
      const userInfo = await fetchUserInfo(page);
      if (!userInfo) return;
      const {
        username,
        userId,
        starNumber,
        articleInfo,
        pinInfo,
        avatar,
        signinInfo,
        unreadMessage,
      } = userInfo;
      await this.userInfoRepository.update(
        { id: accounts[index].userInfo.id },
        {
          username,
          userId,
          avatar,
          userArticleLike: starNumber[0],
          userPinLike: starNumber[1],
          totalArticle: articleInfo[0],
          articleShow: articleInfo[1],
          articleRead: articleInfo[2],
          articleLike: articleInfo[3],
          articleComment: articleInfo[4],
          articleCollect: articleInfo[5],
          totalPin: pinInfo[0],
          totalPinLike: pinInfo[1],
          totalPinComment: pinInfo[2],
          consecutiveDays: signinInfo[0],
          totalDays: signinInfo[1],
          totalMoney: signinInfo[2],
          unreadMessage,
        },
      );
      await this.accountLogsRepository.save({
        account: accounts[index].id,
        type: '系统',
        event: '查询账号信息',
        content: '获取到数据：用户名，ID，头像和内容相关等信息。',
        record: '查询成功',
      });
      progress = Math.ceil(((index + 1) / accounts.length) * 100);
      job.progress(progress);
    });
  }
}
