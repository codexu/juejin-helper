import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import browserInit from 'src/libs/browserInit';
import { Account } from 'src/entities/account.entity';
import { cookiesToString } from 'src/libs/cookie';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'dgram';
import fetchUserInfo from 'src/libs/pageControl/fetchUserInfo';
import { UserInfo } from 'src/entities/userinfo.entity';

@WebSocketGateway(3100)
export class UserEventsGateway {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
  ) {}
  @WebSocketServer()
  server: Server;

  // ws 扫码登录
  @SubscribeMessage('login')
  async onEvent(
    @MessageBody() data: { shareId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { page, destroy } = await browserInit();
    await page.goto('https://juejin.cn/login');
    await page.waitForSelector('img.qrcode-img');
    const qrcodeImg = await page.$eval('img.qrcode-img', (el) => el.src);
    client.send(JSON.stringify({ progress: 'qrcode', qrcodeImg }));
    try {
      await page.waitForNavigation({ timeout: 60000 });
    } catch (error) {
      client.send(
        JSON.stringify({
          progress: 'qrcodeTimeout',
          message: '二维码过期，请重试',
        }),
      );
      destroy();
      return;
    }
    client.send(
      JSON.stringify({
        progress: 'fetchUserInfo',
        message: '正在获取用户信息',
      }),
    );
    const userInfoData = await fetchUserInfo(page);
    if (!userInfoData) {
      client.send(
        JSON.stringify({
          progress: 'failedUserInfo',
          message: '用户信息获取失败',
        }),
      );
      return;
    }
    const { username, userId, starNumber, articleInfo, pinInfo, avatar } =
      userInfoData;
    // userinfo 库 查询是否存在 userId
    const hasUser = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('userInfo.userId = :userId', { userId })
      .getOne();
    const cookies = await page.cookies();
    const cookie = cookiesToString(cookies);
    const userInfo = {
      username,
      userId,
      avatar,
      contribution: 0,
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
    };
    if (hasUser) {
      // 更新 cookie
      client.send(
        JSON.stringify({
          progress: 'updateUserInfo',
          message: '正在更新用户信息',
        }),
      );
      await this.accountRepository.update({ id: hasUser.id }, { cookie });
    } else {
      // 创建新用户
      client.send(
        JSON.stringify({
          progress: 'createUserInfo',
          message: '正在创建新用户',
        }),
      );

      // 为 shareId 的用户添加贡献值500
      if (data.shareId) {
        client.send(
          JSON.stringify({
            progress: 'addContribution',
            message: '正在为你和分享账号增加500贡献值',
          }),
        );
        userInfo.contribution += 500;
        const sharedUser = await this.accountRepository
          .createQueryBuilder('account')
          .leftJoinAndSelect('account.userInfo', 'userInfo')
          .where('userInfo.userId = :userId', { userId: data.shareId })
          .getOne();
        if (sharedUser) {
          sharedUser.userInfo.contribution += 500;
          await this.userInfoRepository.save(sharedUser.userInfo);
        }
      }
      await this.accountRepository.save({
        cookie,
        userInfo,
      });
    }
    client.send(
      JSON.stringify({
        progress: 'success',
        userInfo: { username, cookie, userId },
        message: '登录成功',
      }),
    );
    destroy();
  }
}
