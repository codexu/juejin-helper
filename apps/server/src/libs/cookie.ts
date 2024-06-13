import { Page } from 'puppeteer';

export async function setCookie(page: Page, cookie: string) {
  if (cookie === '') return;
  const cookiesArray = cookie.split(/;/).map((item) => item.split('='));
  const cookies = cookiesArray.map(([name, value]) => ({
    name: name.trim(),
    value: value.trim(),
    domain: '.juejin.cn',
  }));
  await page.setCookie(...cookies);
}

// 将 cookie 转换成 string
export function cookiesToString(cookies: Cookie[]) {
  return cookies
    .map((cookie) => {
      if (cookie.name && cookie.value) {
        return `${cookie.name}=${cookie.value}`;
      }
      return '';
    })
    .join(';');
}
