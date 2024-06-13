import { Page } from 'puppeteer';

// 编辑与发布沸点
export default async function publishPin(page: Page, question: string) {
  try {
    await page.waitForSelector('.editor-body');
    await page.click('.editor-body');
    await page.keyboard.type(question);
    await page.waitForTimeout(1000);
    await page.click('.pin-editor-bottom .submit button');
    page.browser().on('targetcreated', async (target) => {
      const newPage = await target.page();
      if (newPage) {
        await newPage.close();
      }
    });
    await page.waitForTimeout(1000);
  } catch (error) {
    throw new Error(`沸点发布失败：${question}`);
  }
}
