import { Page } from 'puppeteer';

// 编辑与发布文章
export default async function publishPin(
  page: Page,
  title: string,
  article: string,
  description: string,
) {
  try {
    await page.waitForSelector('.title-input');
    await page.type('.title-input', title);
    await page.waitForSelector('.CodeMirror-line');
    await page.click('.CodeMirror-line');
    await page.keyboard.type(article);
    await page.waitForSelector('.publish-popup');
    await page.click('.publish-popup');
    await page.waitForTimeout(500);
    await page.waitForSelector('.publish-popup .panel');
    await page.waitForSelector('.category-list .item');
    await page.click('.category-list .item:nth-child(2)');
    await page.waitForTimeout(500);
    await page.waitForSelector('.tag-input');
    await page.click('.tag-input');
    await page.waitForTimeout(500);
    await page.waitForSelector('.byte-select-dropdown .byte-select-option');
    const tags = await page.$$('.byte-select-option');
    tags[0].click();
    await page.waitForTimeout(500);
    await page.waitForSelector('.byte-input__textarea');
    await page.type('.byte-input__textarea', description);
    await page.waitForTimeout(500);
    await page.waitForSelector('.footer .btn-container .primary');
    await page.click('.footer .btn-container .primary');
    await page.waitForTimeout(500);
    await page.click('.footer .btn-container .primary');
    await page.waitForTimeout(500);
  } catch (error) {
    throw new Error('文章编辑失败');
  }
}
