import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import browserInit from 'src/libs/browserInit';
import { Frame, Page } from 'puppeteer';
import fetchUserInfo from 'src/libs/pageControl/fetchUserInfo';
import { cookiesToString } from 'src/libs/cookie';
import { Observable, Subscriber } from 'rxjs';
import { LoginSseData } from './user.dto';

@Injectable()
export class UserCaptchaService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
  ) {}

  // 通过密码登录
  async loginWithPasswordOnce(
    account: string,
    password: string,
    shareId?: string,
  ) {
    const { page, destroy } = await browserInit('new', true);
    await page.goto('https://juejin.cn/login');
    await page.bringToFront();

    await page.waitForSelector('.other-login-box .clickable');
    await page.click('.other-login-box .clickable');
    await page.waitForSelector('.input-group input[name="loginPhoneOrEmail"]');
    await page.type('.input-group input[name="loginPhoneOrEmail"]', account);
    await page.type('.input-group input[name="loginPassword"]', password);
    await page.click('.btn-login');

    // 等待 .vc_captcha_wrapper 下的 iframe 加载完成
    await page.waitForSelector('iframe');
    // 获取 iframe
    const elementHandle = await page.$('iframe');
    // 获取 iframe 的 contentWindow
    const frame = await elementHandle.contentFrame();
    try {
      await this.handleDrag(page, frame);
    } catch (error) {
      destroy();
      return;
    }
    // 获取 cookie
    const userInfoData = await fetchUserInfo(page);
    if (!userInfoData) {
      destroy();
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
      await this.accountRepository.update(
        { id: hasUser.id },
        { cookie, account, password },
      );
      await this.userInfoRepository.save(userInfo);
    } else {
      if (shareId) {
        userInfo.contribution += 500;
        const sharedUser = await this.accountRepository
          .createQueryBuilder('account')
          .leftJoinAndSelect('account.userInfo', 'userInfo')
          .where('userInfo.userId = :userId', { userId: shareId })
          .getOne();
        if (sharedUser) {
          sharedUser.userInfo.contribution += 500;
          await this.userInfoRepository.save(sharedUser.userInfo);
        }
      }
      await this.accountRepository.save({
        cookie,
        account,
        password,
        userInfo,
      });
    }
    destroy();
  }

  // 通过密码登录
  loginWithPassword(account: string, password: string, shareId?: string) {
    return new Observable((observer: Subscriber<LoginSseData>) => {
      (async () => {
        observer.next({
          data: { message: '正在进入掘金登录页面', type: 'success' },
        });
        const { page, destroy } = await browserInit('new', true);
        await page.goto('https://juejin.cn/login');
        observer.next({
          data: { message: '正在进入输入账号密码', type: 'success' },
        });
        await page.waitForSelector('.other-login-box .clickable');
        await page.click('.other-login-box .clickable');
        await page.waitForSelector(
          '.input-group input[name="loginPhoneOrEmail"]',
        );
        await page.type(
          '.input-group input[name="loginPhoneOrEmail"]',
          account,
        );
        await page.type('.input-group input[name="loginPassword"]', password);
        await page.click('.btn-login');
        observer.next({
          data: { message: '正在破解滑块验证码', type: 'success' },
        });
        try {
          // 等待 .vc_captcha_wrapper 下的 iframe 加载完成
          await page.waitForSelector('iframe');
          // 获取 iframe
          const elementHandle = await page.$('iframe');
          // 获取 iframe 的 contentWindow
          const frame = await elementHandle.contentFrame();
          await this.handleDrag(page, frame);
        } catch (error) {
          console.log('滑块验证失败', error);
          destroy();
          observer.error({
            data: { message: '滑块验证失败，请重试', type: 'error' },
          });
        }
        observer.next({
          data: { message: '正在获取用户信息', type: 'success' },
        });
        // 获取 cookie
        const userInfoData = await fetchUserInfo(page);
        if (!userInfoData) {
          destroy();
          observer.error({
            data: { message: '用户信息获取失败，请重试', type: 'error' },
          });
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
          observer.next({
            data: { message: '正在更新用户信息', type: 'success' },
          });
          await this.accountRepository.update(
            { id: hasUser.id },
            { cookie, account, password },
          );
          await this.userInfoRepository.save(userInfo);
        } else {
          observer.next({
            data: { message: '正在创建用户', type: 'success' },
          });
          if (shareId) {
            userInfo.contribution += 500;
            const sharedUser = await this.accountRepository
              .createQueryBuilder('account')
              .leftJoinAndSelect('account.userInfo', 'userInfo')
              .where('userInfo.userId = :userId', { userId: shareId })
              .getOne();
            if (sharedUser) {
              sharedUser.userInfo.contribution += 500;
              await this.userInfoRepository.save(sharedUser.userInfo);
            }
          }
          await this.accountRepository.save({
            cookie,
            account,
            password,
            userInfo,
          });
        }
        destroy();
        observer.next({
          data: {
            message: '登录成功，正在跳转...',
            type: 'end',
            data: {
              username,
              userId,
              starNumber,
              articleInfo,
              pinInfo,
              avatar,
              cookie,
            },
          },
        });
        observer.complete();
      })();
    });
  }

  // 计算滑块缺口X轴位置
  async getCaptchaX(frame: Frame) {
    await frame.waitForSelector('#captcha_verify_image');
    const coordinateShift = await frame.evaluate(async () => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 1000);
      });
      const image = document.querySelector(
        '.verify-image>#captcha_verify_image',
      ) as HTMLImageElement;
      // 创建一个画布，将 image 转换成canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      // 将像素数据转换为二维数组，处理灰度、二值化，将像素点转换为0（黑色）或1（白色）
      const data: number[][] = [];
      for (let h = 0; h < image.height; h++) {
        data.push([]);
        for (let w = 0; w < image.width; w++) {
          const index = (h * image.width + w) * 4;
          const r = imageData.data[index] * 0.2126;
          const g = imageData.data[index + 1] * 0.7152;
          const b = imageData.data[index + 2] * 0.0722;
          if (r + g + b > 120) {
            data[h].push(1);
          } else {
            data[h].push(0);
          }
        }
      }
      // 通过 data 0 黑色 或 1 白色 的值，绘制到 canvas 上，查看效果
      for (let h = 0; h < image.height; h++) {
        for (let w = 0; w < image.width; w++) {
          ctx.fillStyle = data[h][w] == 1 ? '#fff' : '#000';
          ctx.fillRect(w, h, 1, 1);
        }
      }
      image.src = canvas.toDataURL();
      // 获取缺口图像
      const captchaVerifyImage = document.querySelector(
        '#captcha-verify_img_slide',
      ) as HTMLImageElement;
      // 创建一个画布，将 image 转换成canvas
      const captchaCanvas = document.createElement('canvas');
      captchaCanvas.width = captchaVerifyImage.width;
      captchaCanvas.height = captchaVerifyImage.height;
      const captchaCtx = captchaCanvas.getContext('2d');
      captchaCtx.drawImage(
        captchaVerifyImage,
        0,
        0,
        captchaVerifyImage.width,
        captchaVerifyImage.height,
      );
      const captchaImageData = captchaCtx.getImageData(
        0,
        0,
        captchaVerifyImage.width,
        captchaVerifyImage.height,
      );
      // 将像素数据转换为二维数组，同样处理灰度、二值化，将像素点转换为0（黑色）或1（白色）
      const captchaData: number[][] = [];
      for (let h = 0; h < captchaVerifyImage.height; h++) {
        captchaData.push([]);
        for (let w = 0; w < captchaVerifyImage.width; w++) {
          const index = (h * captchaVerifyImage.width + w) * 4;
          const r = captchaImageData.data[index] * 0.2126;
          const g = captchaImageData.data[index + 1] * 0.7152;
          const b = captchaImageData.data[index + 2] * 0.0722;
          if (r + g + b > 30) {
            captchaData[h].push(0);
          } else {
            captchaData[h].push(1);
          }
        }
      }
      // 通过 captchaData 0 黑色 或 1 白色 的值，绘制到 canvas 上，查看效果
      for (let h = 0; h < captchaVerifyImage.height; h++) {
        for (let w = 0; w < captchaVerifyImage.width; w++) {
          captchaCtx.fillStyle =
            captchaData[h][w] == 1 ? 'rgba(0,0,0,0)' : 'black';
          captchaCtx.fillRect(w, h, 1, 1);
        }
      }
      captchaVerifyImage.src = captchaCanvas.toDataURL();
      // 获取captchaVerifyImage 相对于 .verify-image 的偏移量
      const captchaVerifyImageBox = captchaVerifyImage.getBoundingClientRect();
      const captchaVerifyImageTop = captchaVerifyImageBox.top;
      // 获取缺口图像的位置
      const imageBox = image.getBoundingClientRect();
      const imageTop = imageBox.top;
      // 计算缺口图像的位置，top 向上取整，bottom 向下取整
      const top = Math.floor(captchaVerifyImageTop - imageTop);
      // data 截取从 top 列到 top + image.height 列的数据
      const sliceData = data.slice(top, top + image.height);
      // 循环对比 captchaData 和 sliceData，从左到右，每次增加一列，返回校验相同的数量
      const equalPoints = [];
      // 从左到右，每次增加一列
      for (let leftIndex = 0; leftIndex < sliceData[0].length; leftIndex++) {
        let equalPoint = 0;
        // 新数组 sliceData 截取 leftIndex - leftIndex + captchaVerifyImage.width 列的数据
        const compareSliceData = sliceData.map((item) =>
          item.slice(leftIndex, leftIndex + captchaVerifyImage.width),
        );
        // 循环判断 captchaData 和 compareSliceData 相同值的数量
        for (let h = 0; h < captchaData.length; h++) {
          for (let w = 0; w < captchaData[h].length; w++) {
            if (captchaData[h][w] === compareSliceData[h][w]) {
              equalPoint++;
            }
          }
        }
        equalPoints.push(equalPoint);
      }
      // 找到最大的相同数量，大概率为缺口位置
      return equalPoints.indexOf(Math.max(...equalPoints));
    });
    return coordinateShift + 3;
  }

  // 处理滑块逻辑
  async handleDrag(page: Page, frame: Frame) {
    function easeOutBounce(t: number, b: number, c: number, d: number) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
      }
    }
    // 在浏览器中执行代码，获取图片，创建canvas
    const coordinateShift = await this.getCaptchaX(frame);
    if (coordinateShift) {
      await frame.waitForSelector('.captcha-slider-btn');
      const drag = await frame.$('.captcha-slider-btn');
      const dragBox = await drag.boundingBox();
      const dragX = dragBox.x + dragBox.width / 2;
      const dragY = dragBox.y + dragBox.height / 2;

      await page.mouse.move(dragX, dragY);
      await page.mouse.down();
      await page.waitForTimeout(300);

      // 定义每个步骤的时间和总时间
      const totalSteps = 100;
      const stepTime = 5;

      for (let i = 0; i <= totalSteps; i++) {
        const t = i / totalSteps; // 当前步骤占总时间的比例
        const easeT = easeOutBounce(t, 0, 1, 1); // 使用easeOutBounce函数计算当前位置占总距离的比例

        const newX = dragX + coordinateShift * easeT - 5;
        const newY = dragY + Math.random() * 10;

        await page.mouse.move(newX, newY, { steps: 1 });
        await page.waitForTimeout(stepTime);
      }

      await page.waitForTimeout(800);
      await page.mouse.up();
    }
    try {
      // 等待页面跳转
      await page.waitForNavigation();
    } catch (error) {
      throw new Error('登录失败');
    }
  }
}
