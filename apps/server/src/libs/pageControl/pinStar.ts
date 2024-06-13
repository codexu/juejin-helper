import { Page } from 'puppeteer';

// 沸点详情页 点赞
export default async function pinStar(page: Page) {
  try {
    // 获取沸点内容
    await page.waitForSelector('.content');
    const content = await page.$eval('.content', (node) => {
      return node.textContent.trim();
    });
    await page.waitForSelector('.like-action');
    // 判断是否已赞
    const isStar = await page.$eval('.like-action', (node) => {
      return node.classList.contains('active');
    });
    if (!isStar) {
      await page.click('.like-action');
    }
    return {
      content,
      isStar,
    };
  } catch (error) {
    return false;
  }
}
