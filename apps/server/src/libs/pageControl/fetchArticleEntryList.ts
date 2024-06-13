import { Page } from 'puppeteer';

// 获取用户文章列表
export default async function fetchArticleEntryList(page: Page) {
  try {
    await page.waitForSelector('.entry-list');
    const articles = await page.$$eval(
      '.entry-list > .item .title-row a',
      (elements) => {
        const list = [];
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          list.push({
            href: (element as HTMLAnchorElement).href,
            title: element.textContent.trim(),
          });
        }
        return list;
      },
    );
    return articles;
  } catch (error) {
    return [];
  }
}
