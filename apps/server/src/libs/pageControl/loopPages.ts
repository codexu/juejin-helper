import puppeteer, { Page } from 'puppeteer';
import { setCookie } from '../cookie';
import { Account } from 'src/entities/account.entity';

// 通过用户信息表，循环加载页面，创建浏览器，创建页面，设置 cookie 的基本操作
export default async function loopPages(
  accounts: Account[],
  fn: (page: Page, index: number) => Promise<void>,
  browserHeadless: 'new' | false = 'new',
) {
  const browser = await puppeteer.launch({
    headless: browserHeadless,
    // 设备宽高
    defaultViewport: {
      width: 1600,
      height: 800,
    },
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  for (let index = 0; index < accounts.length; index++) {
    if (accounts[index].cookie) {
      await setCookie(page, accounts[index].cookie);
    }
    console.info(`正在处理第 ${index + 1} / ${accounts.length} 个账号`);
    await fn(page, index);
    // 清理 cookie
    await page.deleteCookie();
  }
  await browser.close();
}
