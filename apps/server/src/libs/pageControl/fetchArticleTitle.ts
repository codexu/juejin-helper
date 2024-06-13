import { Page } from 'puppeteer';

// 签到
export default async function fetchArticleTitle(page: Page) {
  try {
    await page.waitForSelector('.article-title');
    return await page.$eval('.article-title', (node) => {
      return node.textContent.trim();
    });
  } catch (error) {
    return '';
  }
}
