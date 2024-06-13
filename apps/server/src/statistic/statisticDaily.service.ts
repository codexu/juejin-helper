import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Statistic } from 'src/entities/statistic.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class StatisicDailyService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(AccountLog)
    private readonly accountLogRepository: Repository<AccountLog>,
    @InjectRepository(Statistic)
    private readonly statisticRepository: Repository<Statistic>,
  ) {}

  // 记录统计数据
  @Cron('0 0 0 * * *', { name: 'autoFollow', timeZone: 'Asia/Shanghai' })
  async saveDailyStatisic() {
    // 查询所有 cookie 存在的 account，对应的 userinfo 贡献值增加 100
    const accounts = await this.accountRepository.find({
      where: {
        cookie: Not(IsNull()),
      },
    });
    for (const account of accounts) {
      const userInfo = await this.userInfoRepository.findOne({
        where: {
          id: account.id,
        },
      });
      userInfo.contribution += 100;
      await this.userInfoRepository.save(userInfo);
    }
    // 查询 userinfo 表中的数量
    const userCount = await this.userInfoRepository.count();

    // 查询 account 表中的cookie不为空的数量
    const enableUserCount = await this.accountRepository.count({
      where: {
        cookie: Not(IsNull()),
      },
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // 查询 account_log 表中的点赞数
    const articleLikeCount = await this.accountLogRepository
      .createQueryBuilder()
      .where('type = :type', { type: '文章' })
      .andWhere('event = :event', { event: '点赞' })
      .andWhere('createdAt BETWEEN :yesterday AND :tomorrow', {
        yesterday,
        tomorrow,
      })
      .getCount();

    // 查询 account_log 表中的评论数
    const articleCommentCount = await this.accountLogRepository
      .createQueryBuilder()
      .where('type = :type', { type: '文章' })
      .andWhere('event = :event', { event: '评论' })
      .andWhere('createdAt BETWEEN :yesterday AND :tomorrow', {
        yesterday,
        tomorrow,
      })
      .getCount();

    // 查询 account_log 表中的沸点点赞数，时间为昨天范围内
    const pinLikeCount = await this.accountLogRepository
      .createQueryBuilder()
      .where('type = :type', { type: '沸点' })
      .andWhere('event = :event', { event: '点赞' })
      .andWhere('createdAt BETWEEN :yesterday AND :tomorrow', {
        yesterday,
        tomorrow,
      })
      .getCount();

    // 保存到数据库中
    const statistic = new Statistic();
    statistic.userCount = userCount;
    statistic.enableUserCount = enableUserCount;
    statistic.articleLikeCount = articleLikeCount;
    statistic.articleCommentCount = articleCommentCount;
    statistic.pinLikeCount = pinLikeCount;
    await this.statisticRepository.save(statistic);
  }
}
