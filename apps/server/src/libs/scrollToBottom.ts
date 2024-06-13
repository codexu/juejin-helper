import { Page } from 'puppeteer';

// 连续滚动到页面底部，以获取更多数据
export default async function (page: Page, loopCount = 5) {
  for (let i = 0; i < loopCount; i++) {
    await page.waitForTimeout(500);
    // 判断是否到达页面底部
    const isBottom = await page.evaluate(() => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      return scrollTop + window.innerHeight >= scrollHeight;
    });
    if (isBottom) {
      break;
    }
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, scrollHeight);
    });
  }
}
