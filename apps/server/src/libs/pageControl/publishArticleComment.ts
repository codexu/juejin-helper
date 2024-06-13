import { Page } from 'puppeteer';
import scrollToBottom from '../scrollToBottom';
// 文章页编辑与发布评论
export default async function articlePublishComment(
  page: Page,
  comment: string,
) {
  try {
    await page.waitForSelector('.rich-input');
    await scrollToBottom(page, 10);
    await page.type('.rich-input', comment);
    await page.waitForTimeout(500);
    await page.waitForSelector('.submit .submit-btn');
    await page.click('.submit .submit-btn');
    await page.waitForTimeout(500);
    return true;
  } catch (error) {
    return false;
  }
}
