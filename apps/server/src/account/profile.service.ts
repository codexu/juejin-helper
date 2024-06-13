import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Account } from 'src/entities/account.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { faker, fakerZH_CN } from '@faker-js/faker';
import { setCookie } from 'src/libs/cookie';
import browserInit from 'src/libs/browserInit';
import { Page } from 'puppeteer';

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
export class ProfileService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(AccountLog)
    private readonly accountLogRepository: Repository<AccountLog>,
  ) {}

  // 修改个人信息
  async changeProfile(account: Account, page: Page) {
    const { lastUpdate } = account;
    const { username } = account.userInfo;
    if (username && dayjs(lastUpdate).isBefore(dayjs().subtract(1, 'minute'))) {
      try {
        const name = `${fakerZH_CN.music.songName()}${faker.internet.httpStatusCode()}`;
        await setCookie(page, account.cookie);
        await page.goto('https://juejin.cn/user/settings/profile');
        await page.waitForSelector('.byte-form-item');
        await page.waitForTimeout(1000);
        const formItmes = await page.$$('.byte-form-item');
        const nameInput = await formItmes[0].$('input');
        // 清空输入框
        await nameInput.click({ clickCount: 3 });
        await nameInput.press('Backspace');
        await nameInput.type(name);
        await page.waitForTimeout(1000);
        // 修改开始工作时间
        const dateInput = await formItmes[1].$('input');
        await dateInput.click();
        await page.waitForSelector('.byte-date-picker__panel-wrapper');
        // 点击 .byte-icon--double-left 随机 5-10 次
        const randomClick = Math.floor(Math.random() * 5) + 5;
        for (let i = 0; i < randomClick; i++) {
          await page.click('.byte-icon--double-left');
          await page.waitForTimeout(200);
        }
        // 点击随机日期 .byte-date-picker__panel-cell--inner 0-11
        const randomDate = Math.floor(Math.random() * 12);
        // 获取所有 .byte-date-picker__panel-cell--inner
        const dateItems = await page.$$('.byte-date-picker__panel-cell--inner');
        await dateItems[randomDate].click();
        await page.waitForTimeout(1000);
        // 职业方向
        const directionInput = await formItmes[2].$('input');
        await directionInput.click();
        // .byte-select-dropdown
        await page.waitForSelector('.byte-select-dropdown');
        // .byte-select-option
        const directionItems = await page.$$('.byte-select-option');
        // 随机选择一个
        const randomDirection = Math.floor(
          Math.random() * directionItems.length,
        );
        await directionItems[randomDirection].click();
        await page.waitForTimeout(1000);
        // 兴趣标签
        const tags = await formItmes[7].$$('.interest-tag');
        // 随机点击 3 个
        const randomTags = [];
        for (let i = 0; i < 3; i++) {
          const randomTag = Math.floor(Math.random() * tags.length);
          randomTags.push(randomTag);
          await tags[randomTag].click();
          await page.waitForTimeout(200);
        }
        await page.click('.save-btn');
        // 等待接口 https://api.juejin.cn/user_api/v1/user/update_profile 调用成功，获取请求结果
        const response = await page.waitForResponse((response) =>
          response
            .url()
            .includes('https://api.juejin.cn/user_api/v1/user/update_profile'),
        );
        const result = await response.json();
        if (result.err_no === 0) {
          account.lastUpdate = new Date();
          account.userInfo.username = name;
          await this.accountRepository.save(account);
          // 记录日志
          this.accountLogRepository.save({
            type: '账号',
            event: '修改信息',
            content: name,
            record: '修改成功',
            account: account.id,
          });
        } else {
          // 记录日志
          this.accountLogRepository.save({
            type: '账号',
            event: '修改信息',
            content: name,
            record: `修改失败：${result.err_msg}`,
            account: account.id,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 批量修改用户名
  async changeUserName() {
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie != :cookie', { cookie: '' })
      .getMany();

    const { page, destroy } = await browserInit('new', true);
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      await this.changeProfile(account, page);
    }
    destroy();
  }

  // 根据用户 id 修改用户信息
  async changeProfileById(id: number) {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.id = :id', { id })
      .getOne();
    const { page, destroy } = await browserInit('new', true);
    await this.changeProfile(account, page);
    destroy();
  }
}
