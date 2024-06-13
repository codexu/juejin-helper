import { Page } from 'puppeteer';

// 文章详情页 点赞
export default async function articleStar(page: Page) {
  try {
    // 获取文章标题
    await page.waitForSelector('.article-title');
    const title = await page.$eval('.article-title', (node) => {
      return node.textContent.trim();
    });
    await page.waitForSelector('.panel-btn');
    // 判断是否已赞
    const isStar = await page.$eval('.panel-btn', (node) => {
      return node.classList.contains('active');
    });
    if (!isStar) {
      await page.click('.panel-btn');
    }
    // 判断是否已收藏
    const isCollection = await page.$$eval('.panel-btn', (node) => {
      return node[2].classList.contains('active');
    });
    if (!isCollection) {
      const btns = await page.$$('.panel-btn');
      await btns[2].click();
      await page.waitForSelector('.collection-list-modal .list-item');
      await page.click('.collection-list-modal .list-item');
      await page.waitForSelector('.collection-list-modal .confirm-btn');
      await page.click('.collection-list-modal .confirm-btn');
    }
    return {
      title,
      isStar,
      isCollection,
    };
  } catch (error) {
    return false;
  }
}
