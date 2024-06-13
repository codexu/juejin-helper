import { Page } from 'puppeteer';
import publishArticleComment from './publishArticleComment';

// 文章页评论
export default async function articleComment(page: Page, comment = '非常好！') {
  try {
    const isPublish = await publishArticleComment(page, comment);
    if (!isPublish) return false;
  } catch (error) {
    return false;
  }
}
