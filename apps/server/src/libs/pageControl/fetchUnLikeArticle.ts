import { Page } from 'puppeteer';

// 获取用户文章列表，随机选择一篇未点赞的文章
export default async function fetchUnLikeArticle(page: Page) {
  try {
    // 获取已点赞的文章的索引
    await page.waitForSelector('.entry-list');
    const likeIndexArray = await page.$$eval(
      '.entry-list > .item',
      (elements) => {
        const list = [];
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isStar = element.querySelector('.action-list .like.active');
          if (isStar) {
            list.push(i);
          }
        }
        return list;
      },
    );
    // 获取所有文章的dom
    const articleList = await page.$$('.entry-list > .item');
    // 根据 likeIndexArray，将 articleList 中的已点赞文章排除
    const unLikeArticleList = articleList.filter(
      (item, index) => !likeIndexArray.includes(index),
    );
    // 随机选择一篇文章
    const randomIndex = Math.floor(Math.random() * unLikeArticleList.length);
    const randomArticle = unLikeArticleList[randomIndex];
    const article = await page.evaluate((el) => {
      return {
        title: el.querySelector('.title-row a').textContent.trim(),
        href: (el.querySelector('.title-row a') as HTMLAnchorElement).href,
      };
    }, randomArticle);
    const likeRate = Math.round(
      ((articleList.length - unLikeArticleList.length + 1) /
        articleList.length) *
        100,
    );
    return {
      article,
      likeRate,
    };
  } catch (error) {
    return false;
  }
}
