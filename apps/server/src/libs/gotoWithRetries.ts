import { Page } from 'puppeteer';

// 请求访问页面重试
export default async function gotoWithRetries(
  page: Page,
  url: string,
  numRetries = 10,
) {
  let currentTry = 0;
  while (currentTry < numRetries) {
    try {
      await page.goto(url);
      return; // 成功，则直接返回
    } catch (err) {
      currentTry++;
    }
  }
}
