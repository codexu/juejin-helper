import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { CommentDto } from './comment.dto';
import browserInit from 'src/libs/browserInit';
import { Account } from 'src/entities/account.entity';
import { setCookie } from 'src/libs/cookie';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  // 分页获取评论列表
  async list(page: number, pageSize: number, type: string) {
    // 分页获取评论列表 和 总数，根据时间倒序
    const [records, total] = await this.commentRepository.findAndCount({
      where: {
        type,
      },
      order: {
        id: 'DESC',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return {
      records,
      total,
      page,
      pageSize,
    };
  }

  // 添加评论
  async add(commentData: CommentDto) {
    const comment = new Comment();
    comment.content = commentData.content;
    comment.type = commentData.type;
    comment.enable = commentData.enable;
    // 判断是否存在同样的 content
    const existComment = await this.commentRepository.findOne({
      where: { content: commentData.content },
    });
    if (existComment !== null) {
      return false;
    } else {
      await this.commentRepository.save(comment);
      return comment;
    }
  }

  // 修改评论
  async update(id: number, content: string, enable: boolean, type: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (comment !== undefined) {
      comment.content = content;
    }
    if (enable !== undefined) {
      comment.enable = enable;
    }
    if (type !== undefined) {
      comment.type = type;
    }
    await this.commentRepository.save(comment);
    return comment;
  }

  // 删除评论
  async delete(ids: number[]) {
    // 循环删除
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      await this.commentRepository.delete(id);
    }
    return true;
  }

  // 爬虫获取评论
  @Cron('0 0 0 * * *', { name: 'fetchPin', timeZone: 'Asia/Shanghai' })
  async spider() {
    const { page, destroy } = await browserInit('new', true);
    // 获取一个随机账号
    const account = await this.accountRepository.findOne({
      where: {
        id: 1,
      },
    });
    // 设置 cookie
    await setCookie(page, account.cookie);
    const url = 'https://juejin.cn/hot/articles/6809637767543259144';
    await page.goto(url);
    await page.waitForSelector('.hot-list');
    const list = await page.$$eval('.hot-list a.article-item-link', (nodes) => {
      return nodes.map((node) => node.getAttribute('href'));
    });
    for (let index = 0; index < list.length; index++) {
      const articleUrl = list[index];
      await page.goto(`https://juejin.cn${articleUrl}`);
      // 点击 .article-suspended-panel 第二个.panel-btn
      await page.waitForSelector('.article-suspended-panel');
      await page.click('.article-suspended-panel .panel-btn:nth-child(3)');
      // 等待 2 秒
      await page.waitForTimeout(2000);
      await page.waitForSelector('.comment-list');
      const commentList = await page.$$eval(
        '.comment-content div.content',
        (nodes) => {
          return nodes.map((node) => node.innerText);
        },
      );
      // 循环写入数据库
      for (let index = 0; index < commentList.length; index++) {
        const content = commentList[index];
        const comment = new Comment();
        comment.content = content;
        comment.type = '爬虫';
        comment.enable = false;
        // 判断是否存在同样的 content
        const existComment = await this.commentRepository.findOne({
          where: { content },
        });
        if (!existComment) {
          await this.commentRepository.save(comment);
        }
      }
    }
    destroy();
  }
}
