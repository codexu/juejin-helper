import { Controller, Get, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文章管理')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: '爬取文章列表' })
  @Get('fetchList')
  async fetchArticleList() {
    const count = await this.articleService.fetchArticleList();
    return {
      data: count,
      message: `成功爬取 ${count} 篇文章`,
    };
  }

  @ApiOperation({ summary: '爬取文章内容' })
  @Get('fetchArticle')
  async fetchArticle() {
    const data = await this.articleService.fetchArticle();
    return {
      data,
    };
  }

  // 设置审核状态
  @ApiOperation({ summary: '设置审核状态' })
  @Get('setReviewStatus')
  async setReviewStatus(
    @Query('id') id: string,
    @Query('status') status: '0' | '1',
  ) {
    const data = await this.articleService.setReviewStatus(id, status);
    return {
      data,
    };
  }
}
