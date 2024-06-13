import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutomateService } from './automate.service';

@ApiTags('自动化脚本（定时任务）')
@Controller('automate')
export class AutomateController {
  constructor(private readonly automateService: AutomateService) {}

  // 自动签到
  @ApiOperation({ summary: '自动签到' })
  @Get('autoSign')
  async autoSign() {
    this.automateService.autoSign();
    return {
      message: '启动成功',
    };
  }

  // 自动关注
  @ApiOperation({ summary: '自动关注' })
  @Get('autoFollow')
  autoFollow() {
    this.automateService.autoFollow();
    return {
      message: '启动成功',
    };
  }

  // 文章自动点赞
  @ApiOperation({ summary: '文章自动点赞' })
  @Get('autoArticleStar')
  autoArticleStar() {
    this.automateService.autoArticleStar();
    return {
      message: '启动成功',
    };
  }

  // 沸点自动点赞
  @ApiOperation({ summary: '沸点自动点赞' })
  @Get('autoPinStar')
  autoPinStar() {
    this.automateService.autoPinStar();
    return {
      message: '启动成功',
    };
  }

  // 文章自动评论
  @ApiOperation({ summary: '文章自动评论' })
  @Get('autoArticleComment')
  autoArticleComment() {
    this.automateService.autoArticleComment();
    return {
      message: '启动成功',
    };
  }

  // 自动发布沸点
  @ApiOperation({ summary: '自动发布沸点' })
  @Get('autoPin')
  autoPin() {
    this.automateService.autoPin();
    return {
      message: '启动成功',
    };
  }

  // 自动发布文章
  @ApiOperation({ summary: '自动发布文章' })
  @Get('autoArticle')
  autoArticle() {
    this.automateService.autoArticle();
    return {
      message: '启动成功',
    };
  }
}
