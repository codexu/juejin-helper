import { Page } from 'puppeteer';

// 沸点列表页 点赞
export default async function pinListStar(page: Page) {
  try {
    await page.waitForSelector('ul.pin-list li.item');
    const pins = await page.$$('ul.pin-list li.item');
    // 随机获取一条沸点
    const random = Math.floor(Math.random() * pins.length);
    const pin = pins[random];
    const link = await pin.$eval('.pin-header .meta-box a', (el) => el.href);
    const content = await pin.$eval(
      '.pin-content-row > .content-box > span.content',
      (el) => el.innerText,
    );
    await pin.waitForSelector('div.like-action', { timeout: 1000 });
    await pin.evaluate((node) => {
      const likeAction = node.querySelector('div.like-action');
      (likeAction as any).click();
    });
    return {
      link,
      content,
    };
  } catch (error) {
    return false;
  }
}
