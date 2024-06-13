import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import browserInit from 'src/libs/browserInit';
import fetchArticleEntryList from 'src/libs/pageControl/fetchArticleEntryList';

@Injectable()
export class ManualService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  // 检测发布数量`
  async checkQuantity(quantity: number) {
    if (quantity < 1) {
      throw new Error('发布数量不能小于 1');
    }
  }

  // 检测发布者是否有权限，并处理扣除贡献值
  async checkPublisher(authorization: string, quantity = 1, contribution = 0) {
    const taskPublisher = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie = :cookie', { cookie: authorization })
      .getOne();
    if (!taskPublisher) {
      throw new Error('未通过验证，无法发布任务');
    }
    if (taskPublisher.userInfo.contribution < quantity * contribution) {
      throw new Error('贡献值不足，无法发布任务');
    } else {
      // 扣除贡献值
      taskPublisher.userInfo.contribution -= quantity * contribution;
      await this.accountRepository.save(taskPublisher);
    }
    return taskPublisher;
  }

  // 获取用户最新的几篇文章
  async getLatestArticle(authorization: string) {
    const account = await this.accountRepository.findOne({
      where: {
        cookie: authorization,
      },
    });
    const url = `https://juejin.cn/user/${account.mainAccount}/posts`;
    const { page, destroy } = await browserInit();
    await page.goto(url);
    const articleList = await fetchArticleEntryList(page);
    destroy();
    return articleList;
  }
}
