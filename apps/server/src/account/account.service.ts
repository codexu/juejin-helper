import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { setCookie } from 'src/libs/cookie';
import browserInit from 'src/libs/browserInit';
import { UserCaptchaService } from 'src/user/userCaptcha.service';
import { catchError, concat, of } from 'rxjs';
import { Cron } from '@nestjs/schedule';

export interface Message {
  type: string;
  avatar: string;
  name: string;
  userUrl: string;
  contentUrl?: string;
  comment?: string;
  reference?: string;
  title: string;
  time: number;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly userCaptchaService: UserCaptchaService,
  ) {}

  // 获取可访问账号信息，随机返回
  async getAccountInfo(quantity?: number) {
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie != :cookie', { cookie: '' })
      .getMany();

    let sum = accounts.length;
    if (quantity) {
      sum = quantity;
    }

    const randomAccounts = [];
    for (let index = 0; index < sum; index++) {
      const randomIndex = Math.floor(Math.random() * accounts.length);
      randomAccounts.push(accounts[randomIndex]);
      accounts.splice(randomIndex, 1);
    }
    return randomAccounts;
  }

  // 单独访问账号
  async visitAccount(id: number) {
    // 根据 id 查询账号
    const account = await this.accountRepository.findOne({
      where: { id },
    });
    const { page } = await browserInit(false, true);
    await setCookie(page, account.cookie);
    await page.goto('https://juejin.cn/');
    // 需要手动关闭
    // destroy();
  }

  // 查询所有账号的信息
  async findAllWithUserInfo(page: number, pageSize: number) {
    // 分页查询
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .orderBy('account.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const mergedAccounts = accounts[0].map((account) => {
      const data = Object.assign({}, account, account.userInfo, {
        state: account.cookie ? true : false,
        id: account.id,
      });
      delete data.cookie;
      delete data.userInfo;
      return data;
    });
    return {
      records: mergedAccounts,
      total: accounts[1],
    };
  }

  // 手动登录获取 cookie
  @Cron('0 0 4 * * *', { name: 'checkCookie', timeZone: 'Asia/Shanghai' })
  async getCookie() {
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      // 具有 account 和 password
      .where('account.account != :account', { account: '' })
      .andWhere('account.password != :password', { password: '' })
      // 并且 cookie 为 null 或者 ''
      .andWhere('account.cookie is null')
      .orWhere('account.cookie = :cookie', { cookie: '' })
      .getMany();

    const obs = [];
    for (let index = 0; index < accounts.length; index++) {
      try {
        const account = accounts[index];
        const ob = this.userCaptchaService
          .loginWithPassword(account.account, account.password)
          .pipe(
            catchError(() => {
              return of(null);
            }),
          );
        obs.push(ob);
      } catch (error) {
        console.error(error);
      }
    }
    concat(...obs).subscribe({
      next: (data) => {
        console.info(data);
      },
    });
  }

  // 导入账号
  async importAccount(data: Account[]) {
    for (let index = 0; index < data.length; index++) {
      const account = data[index];
      try {
        // 判断 account 是否存在
        const existAccount = await this.accountRepository.findOne({
          where: { account: account.account },
        });
        if (!existAccount) {
          await this.userCaptchaService.loginWithPassword(
            account.account,
            account.password,
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 查询账号消息
  async findMessage(id: number) {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['userInfo'],
    });
    const { page, destroy } = await browserInit('new', true);
    await setCookie(page, account.cookie);
    const messages: Message[] = [];
    // 获取评论消息
    await page.goto('https://juejin.cn/notification');
    await page.waitForSelector('.notification-list');
    await page.waitForTimeout(1000);
    const commentList = await page.$$('.notification-list .item');
    for (let index = 0; index < commentList.length; index++) {
      const item = commentList[index];
      const avatar = await item.$eval('.avatar img', (node) => node.src);
      const name = await item.$eval(
        '.profile a span',
        (node) => node.textContent,
      );
      const userUrl = await item.$eval('.profile a', (node) => node.href);
      const contentUrl = '';
      const comment = await item.$eval('.comment', (node) => node.textContent);
      const reference = await item.$eval('.reference div', (node) =>
        node.innerText.trim(),
      );
      const title = await item.$eval('span.title', (node) =>
        node.innerText.trim(),
      );
      const time = await item.$eval('.action-time', (node) =>
        Number.parseInt(node.getAttribute('datetime')),
      );
      const message = {
        type: '评论',
        avatar,
        name,
        userUrl,
        contentUrl,
        comment,
        reference,
        title,
        time,
      };
      messages.push(message);
    }

    // 获取点赞和收藏消息
    await page.goto('https://juejin.cn/notification/digg');
    await page.waitForSelector('.notification-list');
    await page.waitForTimeout(1000);
    const diggList = await page.$$('.notification-list .item');
    for (let index = 0; index < diggList.length; index++) {
      const item = diggList[index];
      const avatar = await item.$eval('.avatar img', (node) => node.src);
      const name = await item.$eval(
        '.profile a span',
        (node) => node.textContent,
      );
      const userUrl = await item.$eval('.profile a', (node) => node.href);
      const contentUrl = '';
      const title = await item.$eval('span.title', (node) =>
        node.innerText.trim(),
      );
      const timeNode = await item.$('.action-time');
      let time = 0;
      if (timeNode) {
        time = await item.$eval('time.action-time', (node) =>
          Number.parseInt(node.getAttribute('datetime')),
        );
      }
      const message = {
        type: '点赞和收藏',
        avatar,
        name,
        userUrl,
        contentUrl,
        title,
        time,
      };
      if (time !== 0) {
        messages.push(message);
      }
    }
    // 点击其他列，清除红点
    await page.goto('https://juejin.cn/notification/follow');
    await page.goto('https://juejin.cn/notification/im');
    await page.goto('https://juejin.cn/notification/system');

    // 将账号的消息数量置为 0
    this.userInfoRepository.update(
      { id: account.userInfo.id },
      { unreadMessage: 0 },
    );

    // 将message 按照 time 时间排序
    messages.sort((a, b) => b.time - a.time);

    destroy();
    return messages;
  }
}
