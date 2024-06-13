import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Account } from 'src/entities/account.entity';
import { Statistic } from 'src/entities/statistic.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Statistic)
    private readonly statisticRepository: Repository<Statistic>,
    @InjectQueue('manual-queue') private manualQueue: Queue,
  ) {}
  // 仪表盘获取统计数据
  async getDashboardData(days = 15) {
    // 查询账号 type 为 admin 的数量
    const adminAccountCount = await this.accountRepository.count({
      where: {
        type: 'admin',
      },
    });
    // 查询账号 type 为 user 的数量
    const userAccountCount = await this.accountRepository.count({
      where: {
        type: 'user',
      },
    });
    const totalAccountCount = adminAccountCount + userAccountCount;
    // 查询 cookie 不为空的用户数量
    const offlineAccountCount = await this.accountRepository.count({
      where: {
        cookie: '',
      },
    });
    // 获取所有 userinfo 中 userArticleLike 的总和
    const userArticleLikeCount = await this.userInfoRepository.query(
      'SELECT SUM(userArticleLike) AS userArticleLikeCount FROM user_info',
    );
    // 获取所有 userinfo 中 userPinLike 的总和
    const userPinLikeCount = await this.userInfoRepository.query(
      'SELECT SUM(userPinLike) AS userPinLikeCount FROM user_info',
    );
    // 获取贡献值排名前十的用户
    const topUser = await this.userInfoRepository
      .createQueryBuilder('userInfo')
      .orderBy('userInfo.contribution', 'DESC')
      .take(10)
      .getMany();

    // 获取总共的执行任务数量
    const totalJobCount = await this.manualQueue.getJobCounts();

    // 获取最后的days条统计数据
    const statisticData = await this.statisticRepository
      .createQueryBuilder('statistic')
      .orderBy('statistic.createdAt', 'DESC')
      .take(days)
      .getMany()
      .then((data) => {
        return data.reverse();
      });

    return {
      adminAccountCount,
      userAccountCount,
      totalAccountCount,
      offlineAccountCount,
      onlineAccountCount: totalAccountCount - offlineAccountCount,
      totalJobCount,
      userArticleLikeCount: Number(
        userArticleLikeCount[0].userArticleLikeCount,
      ),
      userPinLikeCount: Number(userPinLikeCount[0].userPinLikeCount),
      topUser,
      statisticData,
    };
  }
}
