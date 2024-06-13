import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import scrollToBottom from 'src/libs/scrollToBottom';
import { Pin } from '../entities/pin.entity';
import { Keyword } from '../entities/keyword.entity';
import browserInit from 'src/libs/browserInit';
import { extract } from '@node-rs/jieba';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PinService {
  constructor(
    @InjectRepository(Pin)
    private readonly pinRepository: Repository<Pin>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // 统计
  async statistics() {
    // 获取沸点总数
    const pinsTotal = await this.pinRepository.count();
    // 获取关键词总数
    const keywordsTotal = await this.keywordRepository.count();
    // 获取沸点模板总数
    const templateTotal = await this.pinRepository.count({
      where: { isTemplate: true },
    });
    // 已审核的沸点数
    const aiReviewTotal = await this.pinRepository.count({
      where: { aiReview: true },
    });
    // AI审核通过的沸点数
    const aiReviewResultTotal = await this.pinRepository.count({
      where: { aiReviewResult: true, isTemplate: false },
    });

    return {
      aiReviewTotal,
      aiReviewResultTotal,
      pinsTotal,
      keywordsTotal,
      templateTotal,
    };
  }

  // 爬虫， 爬取热门沸点
  async fetchPin() {
    const { page, destroy } = await browserInit('new', true);
    await page.goto('https://juejin.cn/pins/hot');
    await page.waitForSelector('.pin-list');
    // 每隔 5秒 滚动到底部，持续 5 次。
    await scrollToBottom(page, 20);
    const result = await page.evaluate(() => {
      const list = [...document.querySelectorAll('.pin-list .pin')];
      const pins = list.map((pin) => {
        // data-pin-id 属性为 pin id
        const pinId = pin.getAttribute('data-pin-id');
        // .pin-header data-author-id 属性为作者 id
        const authorId = pin
          .querySelector('.pin-header')
          .getAttribute('data-author-id');
        // .content 为内容
        const content = pin.querySelector('.content').textContent;
        // .club 为圈子
        const club = pin.querySelector('.club')?.textContent;
        // comment-action 为评论数 转换 number 类型
        const comment = Number(
          pin.querySelector('.comment-action').textContent,
        );
        // like-action 为点赞数 转换 number 类型
        const like = Number(pin.querySelector('.like-action').textContent);

        return {
          pinId,
          authorId,
          content,
          club,
          comment,
          like,
        };
      });

      return pins;
    });
    destroy();

    // 遍历 result，将数据存入数据库
    for (let i = 0; i < result.length; i++) {
      const pin = result[i];
      const { pinId } = pin;
      // 通过 pinId 查询数据库，如果存在则更新，不存在则插入
      const existPin = await this.pinRepository.findOne({ where: { pinId } });
      if (existPin) {
        await this.pinRepository.update({ pinId }, pin);
      } else {
        await this.pinRepository.save(pin);
      }
    }

    return result;
  }

  // 分析
  async getKeyword() {
    // 获取所有 pin，只获取 content、comment、like字段
    const pins = await this.pinRepository.find({
      select: ['content', 'comment', 'like', 'pinId', 'authorId'],
    });
    // 如果 keyword weight hot comment like 全部清零
    await this.keywordRepository
      .createQueryBuilder()
      .update()
      .set({
        weight: 0,
        hot: 0,
        comment: 0,
        like: 0,
      })
      .execute();
    // 遍历 pins，分析 content，提取关键词
    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      const { content, like, comment } = pin;
      const keywords = extract(content, 5, 'n,nr,ns,nt,nw,nz,vn');
      // 排除空数组
      if (keywords.length === 0) continue;
      // 遍历 keywords，将数据存入数据库
      for (let j = 0; j < keywords.length; j++) {
        const keywordContent = keywords[j];
        const { weight, keyword } = keywordContent;
        // 在 keyword 表中查找 keyword 是否存在
        const keywordEntity = await this.keywordRepository.findOne({
          where: { word: keyword },
        });
        // 模糊查询 keyword 在 pinRepository 中的数量
        const count = await this.pinRepository
          .createQueryBuilder('pin')
          .where('pin.content LIKE :keyword', { keyword: `%${keyword}%` })
          .getCount();
        const hot = weight * (like + comment);
        // 如果存在，更新热度
        if (keywordEntity) {
          keywordEntity.hot += hot;
          keywordEntity.weight += weight;
          keywordEntity.count = count;
          keywordEntity.comment += comment;
          keywordEntity.like += like;
          // 判断 pinId 是否存在，如果不存在则添加
          if (!keywordEntity.pinIds.includes(`${pin.pinId}`)) {
            keywordEntity.pinIds += `,${pin.pinId}`;
          }
          // 判断 authorId 是否存在，如果不存在则添加
          if (!keywordEntity.authorIds.includes(`${pin.authorId}`)) {
            keywordEntity.authorIds += `,${pin.authorId}`;
          }
          await this.keywordRepository.save(keywordEntity);
        } else {
          // 如果不存在，创建 keywordEntity
          const newKeywordEntity = this.keywordRepository.create({
            word: keyword,
            weight,
            hot,
            count,
            comment,
            like,
            pinIds: pin.pinId,
            authorIds: pin.authorId,
          });
          await this.keywordRepository.save(newKeywordEntity);
        }
      }
    }
  }

  // 数据库查询
  async getKeywordList(size: number) {
    // 前 20 条数据，按照 hot 降序排列，isBlock 为 false
    const keywordList = await this.keywordRepository.find({
      where: { isBlock: false },
      order: { hot: 'DESC' },
      take: size,
    });
    return keywordList.map((item) => ({
      ...item,
      pinIds: item.pinIds.split(',').filter((id) => id),
      authorIds: item.authorIds.split(',').filter((id) => id),
    }));
  }

  // 设置关键词是否屏蔽
  async blockKeyword(id: number, isBlock: boolean) {
    // 根据 id 查询 keyword
    const keyword = await this.keywordRepository.findOne({
      where: {
        id,
      },
    });
    keyword.isBlock = isBlock;
    await this.keywordRepository.save(keyword);
  }

  // 根据 pinId 获取 pin 详情
  async getPinDetail(pinId: string) {
    const pin = await this.pinRepository.findOne({ where: { pinId } });
    return pin;
  }

  // 根据 pinIds 获取 pin 详情
  async getPinDetailList(ids: string[]) {
    const pins = [];
    // 根据 id 列表 ids 查询所有 pin
    for (let i = 0; i < ids.length; i++) {
      const pin = await this.pinRepository.findOne({
        where: { pinId: ids[i] },
      });
      pins.push(pin);
    }
    return pins;
  }

  // 分页查询
  async listPage(
    page: number,
    pageSize: number,
    isTemplate: boolean,
    aiReviewResult: boolean,
  ) {
    const [records, total] = await this.pinRepository
      .createQueryBuilder('pin')
      .where('pin.isTemplate = :isTemplate', { isTemplate })
      .andWhere('pin.aiReviewResult = :aiReviewResult', { aiReviewResult })
      .orderBy('pin.id', 'DESC')
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .select([
        'pin.id',
        'pin.content',
        'pin.isTemplate',
        'pin.aiReview',
        'pin.aiReviewResult',
      ])
      .getManyAndCount();

    return {
      records,
      total,
      page,
      pageSize,
    };
  }

  // 设置模板状态
  async setTemplate(id: number, isTemplate: boolean) {
    const pin = await this.pinRepository.findOne({ where: { id } });
    pin.isTemplate = isTemplate;
    await this.pinRepository.save(pin);
    return pin;
  }

  // 人工审核
  async setAiReviewResult(id: number, aiReviewResult: boolean) {
    const pin = await this.pinRepository.findOne({ where: { id } });
    pin.aiReviewResult = aiReviewResult;
    await this.pinRepository.save(pin);
    return pin;
  }

  // ai 识别沸点内容
  // 每 1 分钟执行一次
  @Cron('0 */1 * * * *', { name: 'aiReview', timeZone: 'Asia/Shanghai' })
  async aiReview() {
    // 获取 30 条未审核的沸点，且不是模板
    const pins = await this.pinRepository.find({
      where: { aiReview: false, isTemplate: false },
      take: 5,
    });
    // 如果没有未审核的沸点，返回
    if (pins.length === 0) return;
    // 遍历 pins，调用 ai 识别接口
    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      const { content } = pin;
      const chatContent = `判断这个沸点"${content}"是否出现了"时间"、"地点"、"描述了一可能最近的事"，只回复是或否`;
      // 获取环境变量
      const chatKey = this.configService.get<string>('CHAT_KEY');
      const { data } = await firstValueFrom(
        this.httpService.post(
          'https://api.chatanywhere.com.cn/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: chatContent,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${chatKey}`,
            },
          },
        ),
      );
      if (data) {
        pin.aiReview = true;
        await this.pinRepository.save(pin);
      }
      if (data.choices[0].message.content.includes('否')) {
        pin.aiReviewResult = true;
        pin.isTemplate = true;
        await this.pinRepository.save(pin);
      }
    }
  }

  // 定时爬取沸点
  @Cron('0 0 0 * * *', { name: 'fetchPin', timeZone: 'Asia/Shanghai' })
  async cronTask() {
    await this.fetchPin();
    await this.getKeyword();
  }
}
