import { Body, Controller, Get, Post, Query, Headers } from '@nestjs/common';
import { ManualService } from './manual.service';
import { ManualArticleReadService } from './manualArticleRead.service';
import { ManualArticleStarService } from './manualArticleStar.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ManualArticleCommentDto,
  ManualArticleListReadDto,
  ManualArticleReadDto,
  ManualPinCommentDto,
} from './manual.dto';
import { ManualArticleCommentService } from './manualArticleComment.service';
import { ManualPinStarService } from './manualPinStar.service';
import { ManualPinCommentService } from './manualPinComment.service';

@ApiTags('手动脚本')
@Controller('manual')
export class ManualController {
  constructor(
    private readonly manualService: ManualService,
    private readonly manualArticleReadService: ManualArticleReadService,
    private readonly manualArticleStarService: ManualArticleStarService,
    private readonly manualArticleCommentService: ManualArticleCommentService,
    private readonly manualPinStarService: ManualPinStarService,
    private readonly manualPinCommentService: ManualPinCommentService,
  ) {}

  // 获取本账号的最新几篇文章
  @ApiOperation({ summary: '获取本账号的最新几篇文章' })
  @Get('getLatestArticle')
  async getLatestArticle(@Headers('authorization') authorization?: string) {
    const data = await this.manualService.getLatestArticle(authorization);
    return {
      data,
    };
  }

  // 根据文章地址点赞文章
  @ApiOperation({ summary: '指定文章点赞' })
  @Get('manualArticleStar')
  async manualArticleStar(
    @Query('articleUrl') articleUrl: string,
    @Query('quantity') quantity: number,
    @Query('delay') delay?: number,
    @Query('priority') priority?: number,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualArticleStarService.manualArticleStar(
      authorization,
      articleUrl,
      quantity,
      delay,
      priority,
    );
    return {
      data,
      message: '启动成功',
    };
  }

  // 根据文章地址评论文章
  @Post('manualArticleComment')
  @ApiOperation({ summary: '指定文章评论' })
  @ApiBody({ type: ManualArticleCommentDto })
  async manualArticleComment(
    @Body() manualArticleCommentDto: ManualArticleCommentDto,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualArticleCommentService.manualArticleComment(
      authorization,
      manualArticleCommentDto,
    );
    return {
      data,
      message: '启动成功',
    };
  }

  // 手动为用户文章列表随机点赞
  @ApiOperation({ summary: '文章列表随机点赞' })
  @Get('manualUserArticleRandomStar')
  async manualUserArticleRandomStar(
    @Query('postUrl') postUrl: string,
    @Query('quantity') quantity: number,
  ) {
    const data =
      await this.manualArticleStarService.manualUserArticleRandomStar(
        postUrl,
        quantity,
      );
    return {
      data,
      message: '启动成功',
    };
  }

  // 根据文章地址点赞文章
  @ApiOperation({ summary: '指定文章刷阅读量' })
  @Post('manualArticleRead')
  async manualArticleRead(
    @Body() manualArticleReadDto: ManualArticleReadDto,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualArticleReadService.read(
      authorization,
      manualArticleReadDto,
    );
    return {
      data,
      message: '启动成功',
    };
  }

  // 手动为用户文章列表所有文章刷阅读量
  @ApiOperation({ summary: '文章列表所有文章刷阅读量' })
  @Post('manualArticleListRead')
  async manualUserArticleRead(
    @Body() manualArticleListReadDto: ManualArticleListReadDto,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualArticleReadService.readList(
      authorization,
      manualArticleListReadDto,
    );
    return {
      data,
      message: '启动成功',
    };
  }

  // 根据文章地址点赞文章
  @ApiOperation({ summary: '指定沸点点赞' })
  @Get('manualPinStar')
  async manualPinStar(
    @Query('url') url: string,
    @Query('quantity') quantity: number,
    @Query('delay') delay?: number,
    @Query('priority') priority?: number,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualPinStarService.manualPinStar(
      authorization,
      url,
      quantity,
      delay,
      priority,
    );
    return {
      data,
      message: '启动成功',
    };
  }

  // 指定沸点评论
  @Post('manualPinComment')
  @ApiOperation({ summary: '指定沸点评论' })
  @ApiBody({ type: ManualPinCommentDto })
  async manualPinComment(
    @Body() manualPinCommentDto: ManualPinCommentDto,
    @Headers('authorization') authorization?: string,
  ) {
    const data = await this.manualPinCommentService.manualPinComment(
      authorization,
      manualPinCommentDto,
    );
    return {
      data,
      message: '启动成功',
    };
  }
}
