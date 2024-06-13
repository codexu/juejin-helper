import { Page } from 'puppeteer';
import checkLoginState from './checkLoginState';

// 签到
export default async function fetchUserInfo(page: Page) {
  try {
    await page.goto('https://juejin.cn/creator/data/content/article/entire');
    // 获取未读信息
    await page.waitForSelector('.notification', {
      timeout: 5000,
    });
    const notification = await page.$('.notification');
    // 判断是否存在 span.count
    const count = await notification.$('.count');
    let unreadMessage = 0;
    if (count) {
      unreadMessage = await page.$eval(
        '.notification .notification-a span.count',
        (node) => {
          return Number.parseInt(node.innerText.trim());
        },
      );
    }
    const loginState = await checkLoginState(page);
    await page.click('.avatar-wrapper');
    if (!loginState.state) return;
    // 获取头像
    await page.waitForSelector('.avatar-wrapper img');
    const avatar = await page.$eval('.avatar-wrapper img', (node) =>
      node.getAttribute('src'),
    );
    // 获取用户 ID
    await page.waitForSelector('.drop-down-menu .dropdown-list .dropdown-item');
    await page.click('.drop-down-menu .dropdown-list .dropdown-item');
    await page.waitForNavigation();
    const url = await page.url();
    const userId = url.split('/').pop();
    // 获取赞的数量
    await page.waitForSelector('.list-header .header-content div.nav-item');
    // 点击最后一个
    const navItems = await page.$$('.list-header .header-content div.nav-item');
    await navItems[navItems.length - 1].click();
    await page.waitForSelector(
      '.list-header .header-content div.nav-item .more-panel .more-item',
    );
    const starNumber = await page.$$eval(
      '.list-header .header-content div.nav-item .more-panel a.more-item',
      (nodes) => [
        // 截取空格后面的数字
        Number.parseInt(nodes[0].innerText.split(' ')[1]),
        Number.parseInt(nodes[1].innerText.split(' ')[1]),
      ],
    );
    // 获取文章信息
    await page.goto('https://juejin.cn/creator/data/content/article/entire');
    await page.waitForSelector('.card-warp .data-card div.data');
    const articleInfo = await page.$$eval(
      '.card-warp .data-card div.data',
      (nodes) => nodes.map((node) => Number.parseInt(node.innerText)),
    );
    // 获取沸点数据
    await page.goto('https://juejin.cn/creator/data/content/pin/entire');
    await page.waitForSelector('.card-warp .data-card div.data');
    const pinInfo = await page.$$eval(
      '.card-warp .data-card div.data',
      (nodes) => nodes.map((node) => Number.parseInt(node.innerText)),
    );
    // 获取矿石数据
    await page.goto('https://juejin.cn/user/center/signin');
    await page.waitForSelector('.figures');
    await page.waitForTimeout(2000);
    const signinInfo = await page.$$eval('.figures span.figure', (nodes) =>
      nodes.map((node) => Number.parseInt(node.innerText)),
    );
    return {
      username: loginState.username.trim(),
      userId,
      avatar,
      starNumber,
      articleInfo,
      pinInfo,
      signinInfo,
      unreadMessage,
    };
  } catch (error) {
    return false;
  }
}
