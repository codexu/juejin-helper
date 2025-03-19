import { Page } from 'puppeteer';

// 检查用户是否登录，根据爬取用户名信息，判断是否已登录
export default async function (page: Page, timeout = 20000) {
  try {
    await page.waitForSelector('.avatar-wrapper', {
      timeout,
    });
    await page.click('.avatar-wrapper');
    await page.waitForTimeout(500);
    await page.waitForSelector('.user-card .username', {
      timeout,
    });
    const username = await page.$eval('.user-card .username', (node) =>
      node.textContent.trim(),
    );
    console.log('username', username);
    await page.click('.avatar-wrapper');
    return {
      state: true,
      username,
    };
  } catch (error) {
    return {
      state: false,
      username: '',
    };
  }
}
