import { Page } from 'puppeteer';

// 进入页面，等待一秒，只读
export default async function onlyRead(page: Page, articles: string[]) {
  try {
    for (let index = 0; index < articles.length; index++) {
      await page.goto(articles[index]);
      await page.waitForTimeout(1000);
    }
  } catch (error) {
    return false;
  }
}
