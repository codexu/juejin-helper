import { ElementHandle, Page } from 'puppeteer';

export default async function fetchFollow(page: Page) {
  await page.waitForSelector('.hot-list > .author-item-link');
  const authorList = await page.$$('.hot-list > .author-item-link');
  // 获取一个未关注的作者
  await page.waitForTimeout(1000);
  const unconcernedAuthor: ElementHandle<Element>[] = [];
  for (let j = 0; j < authorList.length; j++) {
    const follow = await authorList[j].$('.byte-btn--primary');
    if (follow) {
      unconcernedAuthor.push(authorList[j]);
    }
  }
  // 随机选择一个作者
  const author =
    unconcernedAuthor[Math.floor(Math.random() * unconcernedAuthor.length)];
  const name = await author.$eval('.name', (node) => node.textContent);
  // 点击关注
  const button = await author.$('.byte-btn--primary');
  await button.click();
  await page.waitForTimeout(1000);

  return name.trim();
}
