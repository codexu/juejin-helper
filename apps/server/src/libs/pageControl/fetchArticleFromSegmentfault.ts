import { Account } from 'src/entities/account.entity';
import gotoWithRetries from '../gotoWithRetries.js';
import puppeteer, { Page } from 'puppeteer';

interface Article {
  title: string;
  link: string;
}

const url = 'https://segmentfault.com/t/javascript/blogs?page=';
const articles: Article[] = [];
let index = 0;

async function loopFetchArticle(page: Page, accounts: Account[]) {
  if (articles.length < accounts.length) {
    index += 1;
    await gotoWithRetries(page, `${url}${index}`);
    await page.waitForSelector('.list-card-bg .list-group');
    const list = await page.$$eval(
      '.list-card-bg .list-group .item-wrap',
      (nodes) => {
        const result: Article[] = [];
        nodes.forEach((node) => {
          const title = node.querySelector('a.title');
          if (title instanceof HTMLAnchorElement) {
            result.push({
              title: title.innerText,
              link: title.href,
            });
          }
        });
        return result;
      },
    );
    articles.push(...list);
    await loopFetchArticle(page, accounts);
  }
}

export async function fetchArticleList(accounts: Account[]) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1200,
        height: 1080,
      },
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await loopFetchArticle(page, accounts);
    browser.close();
  } catch (error) {
  } finally {
    return articles;
  }
}

export async function fetchArticle(page: Page, href: string) {
  await gotoWithRetries(page, href);
  await page.waitForSelector('article.article');
  const content = await page.$eval('article.article', (node) => node.innerHTML);
  const contentHTML = content.replace(/<img.*?>/g, '');
  const description = await page.$eval(
    'head > meta[name="description"]',
    (el) => el.getAttribute('content'),
  );
  return {
    content: contentHTML,
    description,
  };
}
