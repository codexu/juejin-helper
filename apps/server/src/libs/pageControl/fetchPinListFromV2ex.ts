// 从 v2ex 获取最新的问题列表，用以发布沸点
import puppeteer, { Page } from 'puppeteer';
import { Account } from 'src/entities/account.entity';
import gotoWithRetries from '../gotoWithRetries';

const url = 'https://v2ex.com/recent?p=';
const pins: string[] = [];
let index = 10;

async function loopFetchPin(page: Page, account: Account[]) {
  // 根据 account.json 中的账号数量，循环获取问题，确保获取到的问题数量足够
  if (pins.length < account.length) {
    index += 1;
    await gotoWithRetries(page, `${url}${index}`);
    await page.waitForSelector('.box .cell .topic-link');
    const questions = await page.evaluate(() => {
      const questions = document.querySelectorAll('.box .cell .topic-link');
      const questionsArray: string[] = [];
      for (let i = 0; i < questions.length; i++) {
        questionsArray.push(questions[i].textContent);
      }
      return questionsArray;
    });
    pins.push(...questions);
    await loopFetchPin(page, account);
  }
}

export default async function fetchPinListFromV2ex(account: Account[]) {
  try {
    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 1300,
        height: 600,
      },
      headless: 'new',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await loopFetchPin(page, account);
    browser.close();
    return pins;
  } catch (error) {
    return false;
  }
}
