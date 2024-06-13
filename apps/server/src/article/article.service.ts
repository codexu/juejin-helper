import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleReserve } from '../entities/articleReserve.entity';
import browserInit from 'src/libs/browserInit';
import gotoWithRetries from 'src/libs/gotoWithRetries';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleReserve)
    private readonly articleRepository: Repository<ArticleReserve>,
  ) {}

  // 爬虫， 爬取热门沸点
  @Cron('0 0 0 * * *', { name: 'fetchArticle', timeZone: 'Asia/Shanghai' })
  async fetchArticleList() {
    const { page, destroy } = await browserInit('new', true);
    const url = 'https://segmentfault.com/t/javascript/blogs?page=';
    const articleList = [];

    // 循环爬取 5 页
    for (let pageNo = 1; pageNo <= 5; pageNo += 1) {
      await gotoWithRetries(page, `${url}${pageNo}`);
      console.log(`${url}${pageNo}`);
      await page.waitForSelector('.list-group');
      const list = await page.$$eval('.list-group .item-wrap', (nodes) => {
        const result: { title: string; articleId: string }[] = [];
        nodes.forEach((node) => {
          const title = node.querySelector('a.title');
          if (title instanceof HTMLAnchorElement) {
            const articleId = title.href.split('/').pop();
            result.push({
              title: title.innerText,
              articleId,
            });
          }
        });
        return result;
      });
      articleList.push(...list);
    }
    destroy();
    let addCount = 0;
    articleList.forEach(async (item) => {
      const article = await this.articleRepository.findOne({
        where: {
          articleId: item.articleId,
        },
      });
      if (!article) {
        await this.articleRepository.save({
          articleId: item.articleId,
          title: item.title,
        });
        addCount += 1;
      }
    });
    return addCount;
  }

  // 读取数据库中的文章列表，进行查询内容，定时任务
  @Cron('0 0 * * * *', { name: 'fetchArticle', timeZone: 'Asia/Shanghai' })
  async fetchArticle() {
    // 查询 articleRepository 列表中，获取一条 content 为空的数据
    const article = await this.articleRepository.findOne({
      where: {
        content: IsNull(),
      },
    });
    if (article) {
      const { page, destroy } = await browserInit('new', true);
      const url = `https://segmentfault.com/a/${article.articleId}`;
      await gotoWithRetries(page, url);
      await page.waitForSelector('article.article');
      const content = await page.$eval(
        'article.article',
        (node) => node.innerHTML,
      );
      const contentHTML = content.replace(/<img.*?>/g, '');
      await this.articleRepository.update(
        { articleId: article.articleId },
        {
          content: contentHTML,
        },
      );
      destroy();
    }
    return article;
  }

  // 设置审核状态
  async setReviewStatus(id: string, status: '0' | '1') {
    await this.articleRepository.update(
      { id: Number(id) },
      {
        isPass: status === '1' ? true : false,
      },
    );
    return true;
  }
}
