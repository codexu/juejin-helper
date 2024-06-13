import { Page } from 'puppeteer';

// 文章列表页 点赞
export default async function articleListStar(page: Page) {
  try {
    // 获取所有的 .content-main
    await page.waitForSelector('.content-main');
    const articleList = await page.$$('.content-main');
    // 过滤 articleList 中存在 .lick.active 的文章
    for (let i = 0; i < articleList.length; i++) {
      const liked = await articleList[i].$('.like.active');
      if (!liked) {
        articleList.slice(i, 1);
      }
    }
    const article = articleList[Math.floor(Math.random() * articleList.length)];
    const btn = await article.$('.liked-wrap');
    const title = await article.$eval(
      '.title-row .title',
      (node) => node.textContent,
    );
    const link = await article.$eval('.title-row .title', (node) =>
      node.getAttribute('href'),
    );
    await btn.click();
    await page.waitForTimeout(1000);
    return {
      title,
      link: `https://juejin.cn${link}`,
    };
  } catch (error) {
    return false;
  }
}
