import { Page } from 'puppeteer';

// 签到
export default async function fetchSign(page: Page) {
  try {
    const signinBtn = await page.$('.code-calender .signin');
    if (signinBtn) {
      await page.waitForTimeout(500);
      await signinBtn.click();
      await page.waitForTimeout(500);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
