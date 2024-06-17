import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { AccountLog } from 'src/entities/accountLog.entity';
import { Account } from 'src/entities/account.entity';
import { Comment } from 'src/entities/comment.entity';
import { AccountService } from 'src/account/account.service';

import checkLoginState from 'src/libs/pageControl/checkLoginState';
import fetchFollow from 'src/libs/pageControl/fetchFollow';
import loopPages from 'src/libs/pageControl/loopPages';
import articleListStar from 'src/libs/pageControl/articleListStar';
import pinListStar from 'src/libs/pageControl/pinListStar';
import gotoWithRetries from 'src/libs/gotoWithRetries';
import publishPin from 'src/libs/pageControl/publishPin';
import {
  fetchArticle,
  fetchArticleList,
} from 'src/libs/pageControl/fetchArticleFromSegmentfault';
import publishArticle from 'src/libs/pageControl/publishArticle';
import fetchSign from 'src/libs/pageControl/fetchSign';
import { UserInfo } from 'src/entities/userinfo.entity';
import scrollToBottom from 'src/libs/scrollToBottom';
import { Pin } from 'src/entities/pin.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import articlePublishComment from 'src/libs/pageControl/publishArticleComment';

@Injectable()
export class AutomateService {
  constructor(
    @InjectRepository(AccountLog)
    private accountLogsRepository: Repository<AccountLog>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Pin)
    private pinRepository: Repository<Pin>,
    private schedulerRegistry: SchedulerRegistry,
    private accountService: AccountService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // 定时签到，每天5,6,7,8点签到，重复签到，防止漏签
  @Cron('0 0 5,6,7,8 * * *', { name: 'autoSign', timeZone: 'Asia/Shanghai' })
  async autoSign() {
    const accounts = await this.accountService.getAccountInfo();
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, 'https://juejin.cn/user/center/signin');
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const isSign = await fetchSign(page);
      await gotoWithRetries(page, 'https://juejin.cn/user/center/lottery');
      await page.waitForTimeout(3000);
      const btn = await page.$('#turntable-item-0');
      const isFree = await btn.$('.text-free');
      if (isFree) {
        await btn.click();
      }
      await page.waitForTimeout(1000);
      if (isSign) {
        await this.accountLogsRepository.save({
          type: '账号',
          event: '签到',
          content: '掘金每日签到，抽奖',
          record: '签到成功',
          account: accounts[index].id,
        });
      }
    });
  }

  // 定时关注，每周一，20点关注
  @Cron('0 0 20 * * 1', { name: 'autoFollow', timeZone: 'Asia/Shanghai' })
  async autoFollow() {
    const accounts = await this.accountService.getAccountInfo();
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(
        page,
        'https://juejin.cn/hot/authors/6809637767543259144/1',
      );
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const name = await fetchFollow(page);
      this.accountLogsRepository.save({
        type: '账号',
        event: '关注',
        content: name,
        record: '关注成功',
        account: accounts[index].id,
      });
      await this.userInfoRepository.update(accounts[index].userInfo.id, {
        contribution: accounts[index].userInfo.contribution + 20,
      });
    });
  }

  // 文章自动点赞，定时点赞，每天8点30文章点赞
  @Cron('0 30 7 * * *', { name: 'autoArticleStar', timeZone: 'Asia/Shanghai' })
  async autoArticleStar() {
    const accounts = await this.accountService.getAccountInfo();
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, 'https://juejin.cn/');
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      await scrollToBottom(page, 3);
      const data = await articleListStar(page);
      if (!data) return;
      this.accountLogsRepository.save({
        type: '文章',
        event: '点赞',
        content: data.title,
        link: data.link,
        account: accounts[index].id,
      });
      await this.userInfoRepository.update(accounts[index].userInfo.id, {
        contribution: accounts[index].userInfo.contribution + 10,
      });
    });
  }

  // 沸点自动点赞，定时点赞，每天8点沸点点赞
  @Cron('0 0 8 * * *', { name: 'autoPinStar', timeZone: 'Asia/Shanghai' })
  async autoPinStar() {
    const accounts = await this.accountService.getAccountInfo();
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, 'https://juejin.cn/pins');
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      const pin = await pinListStar(page);
      if (!pin) return;
      await this.accountLogsRepository.save({
        type: '沸点',
        event: '点赞',
        content: pin.content,
        link: pin.link,
        account: accounts[index].id,
      });
      await this.userInfoRepository.update(accounts[index].userInfo.id, {
        contribution: accounts[index].userInfo.contribution + 5,
      });
    });
  }

  // 文章自动评论，每周三晚 8 点评论
  @Cron('0 0 20 * * 3', { name: 'autoPin', timeZone: 'Asia/Shanghai' })
  async autoArticleComment() {
    const accounts = await this.accountService.getAccountInfo();
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, 'https://juejin.cn/');
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      await page.waitForSelector('.entry-list');
      const article = await page.$$('.title-row a.title').then((res) => {
        // 随机获取一篇文章
        const random = Math.floor(Math.random() * res.length);
        return res[random].evaluate((node) => {
          return {
            title: node.innerText,
            href: node.href,
          };
        });
      });
      const chatKey = this.configService.get<string>('CHAT_KEY');
      const { data } = await firstValueFrom(
        this.httpService.post(
          'https://api.chatanywhere.com.cn/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `根据文章标题“${article.title}“，给出一个简短的评论，不要超过30字，不要有叹号，回答俏皮一点，不要有实际观点，，别非常容易被识别为机器人的回答`,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${chatKey}`,
            },
          },
        ),
      );
      const comment = data.choices[0].message.content.replace(
        /[.,!"“”。！]/g,
        '',
      );
      console.log(`正在评论文章： ${article.title}，内容为：${comment}`);
      await page.goto(article.href);
      const commentResult = await articlePublishComment(page, comment);
      if (!commentResult) return;
      this.accountLogsRepository.save({
        type: '文章',
        event: '评论',
        content: article.title,
        link: article.href,
        record: comment,
        account: accounts[index].id,
      });
      const id = accounts[index].id;
      const userInfo = await this.userInfoRepository.findOne({
        where: { id },
      });
      await this.userInfoRepository.update(userInfo.id, {
        contribution: userInfo.contribution + 20,
      });
    });
  }

  // 定时发布沸点，每周二，20点发布
  @Cron('0 0 20 * * 2', { name: 'autoPin', timeZone: 'Asia/Shanghai' })
  async autoPin() {
    const accounts = await this.accountService.getAccountInfo();
    const questions = await this.pinRepository
      .createQueryBuilder('pin')
      .where('pin.isTemplate = :isTemplate', { isTemplate: true })
      .orderBy('RAND()')
      .getMany();
    if (!questions) return;
    await loopPages(accounts, async (page, index) => {
      await gotoWithRetries(page, 'https://juejin.cn/pins?source=mainHeader');
      const loginState = await checkLoginState(page);
      if (!loginState.state) return;
      await publishPin(page, questions[index].content);
      await this.accountLogsRepository.save({
        type: '沸点',
        event: '发布',
        content: questions[index].content,
        record: '发布成功',
        account: accounts[index].id,
      });
    });
  }

  // 定时发布文章，每周五，20点发布
  // @Cron('0 0 20 * * 5', { name: 'autoArticle', timeZone: 'Asia/Shanghai' })
  async autoArticle() {
    const accounts = await this.accountService.getAccountInfo();

    const articleList = await fetchArticleList(accounts);

    if (articleList.length === 0) return;

    await loopPages(accounts, async (page, index) => {
      const startTimestamp = Date.now();
      const { content, description } = await fetchArticle(
        page,
        articleList[index].link,
      );
      await page.goto('https://juejin.cn/editor/drafts/new?v=2');
      await publishArticle(
        page,
        articleList[index].title,
        content,
        description,
      );
      const endTimestamp = Date.now();
      const time = (endTimestamp - startTimestamp) / 1000;
      this.accountLogsRepository.save({
        type: '文章',
        event: '发布',
        content: articleList[index].title,
        record: `发布成功，耗时${time}秒`,
        account: accounts[index].id,
      });
    });
  }

  // 获取定时任务
  async getTask(taskname: string) {
    // 获取所有任务
    const job = this.schedulerRegistry.getCronJob(taskname);
    return job.running;
  }
}
